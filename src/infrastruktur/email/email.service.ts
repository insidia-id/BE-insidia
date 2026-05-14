import {
  sendWithNodemailer,
  resend,
  clientPostmark,
} from './email.repository.js';
import type { EmailOptions } from './email.dto.js';
import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { shouldFallbackFromResend } from './email.utils.js';
@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  async sendEmailWithNodemailer(options: EmailOptions) {
    try {
      const info = await sendWithNodemailer.sendMail({
        from: process.env.EMAIL_USER,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });
      return info;
    } catch (error) {
      this.logger.error('Gagal mengirim email', {
        to: options.to,
        subject: options.subject,
        error,
      });

      throw new InternalServerErrorException('Gagal mengirim email');
    }
  }
  async sendEmailWithResend(options: EmailOptions) {
    return await resend.emails.send({
      from: 'Insidia Team <insidia@insidia.id>',
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });
  }
  async sendEmailWithPostmark(options: EmailOptions) {
    return await clientPostmark.sendEmail({
      From: 'Insidia Team <' + process.env.EMAIL_FROM + '>',
      To: options.to,
      Subject: options.subject,
      HtmlBody: options.html,
      TextBody: options.text,
    });
  }
  async sendEmail(payload: EmailOptions) {
    if (process.env.NODE_ENV === 'development') {
      return this.sendEmailWithNodemailer(payload);
    }

    try {
      return await this.sendEmailWithResend(payload);
    } catch (resendError: any) {
      if (!shouldFallbackFromResend(resendError)) {
        this.logger.error('Resend gagal dan tidak layak fallback', {
          to: payload.to,
          subject: payload.subject,
          error: resendError,
        });

        throw new InternalServerErrorException('Gagal mengirim email');
      }

      this.logger.warn('Fallback ke Postmark karena Resend gagal', {
        to: payload.to,
        subject: payload.subject,
        error: resendError,
      });

      try {
        return await this.sendEmailWithPostmark(payload);
      } catch (postmarkError: any) {
        this.logger.error('Semua provider email gagal', {
          to: payload.to,
          subject: payload.subject,
          resendError,
          postmarkError,
        });

        throw new InternalServerErrorException('Semua provider email gagal');
      }
    }
  }
}
