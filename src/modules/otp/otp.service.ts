import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { randomBytes, randomInt } from 'crypto';
import { RateLimitService } from '../../shared/rate-limit/rate-limit.service';
import { RedisService } from '../../infrastruktur/redis/redis.service';
import { EmailService } from '../../infrastruktur/email/email.service';
import { EmailTemplate } from '../../infrastruktur/email/email.template';
import type { OtpRecord, RequestOtpParams, VerifyOtpParams } from './otp.types';
import {
  hashValue,
  normalizeOtp,
  normalizePurpose,
  normalizeRecipient,
  parseOtpRecord,
  safeHashEqual,
} from './otp.utils';
@Injectable()
export class OtpService {
  private readonly otpTtlMs = 5 * 60 * 1000;
  private readonly maxAttempts = 5;

  constructor(
    private readonly redisService: RedisService,
    private readonly rateLimitService: RateLimitService,
    private readonly emailService: EmailService,
  ) {}

  async sendOtp(params: RequestOtpParams) {
    const recipient = normalizeRecipient(params.recipient);
    const purpose = normalizePurpose(params.purpose);

    await this.consumeRequestLimit({ ...params, recipient, purpose });

    const otp = String(randomInt(0, 1000000)).padStart(6, '0');
    const token = randomBytes(32).toString('hex');
    const record: OtpRecord = {
      recipient,
      purpose,
      hash: hashValue(otp),
      attemptsLeft: this.maxAttempts,
    };
    const { html, text } = EmailTemplate(otp);
    await this.redisService.instance.set(
      this.otpKey(purpose, token),
      JSON.stringify(record),
      'PX',
      this.otpTtlMs,
    );
    await this.emailService.sendEmail({
      to: recipient,
      subject: 'Kode OTP Anda',
      html,
      text,
    });
    if (process.env.NODE_ENV !== 'production') {
      console.log(`OTP ${purpose} untuk ${recipient}: ${otp}`);
    }

    return {
      token,
      expiresInSeconds: Math.floor(this.otpTtlMs / 1000),
      devOtp: process.env.NODE_ENV !== 'production' ? otp : undefined,
    };
  }

  async verifyOtp(params: VerifyOtpParams) {
    const purpose = normalizePurpose(params.purpose);
    const otp = normalizeOtp(params.otp);

    await this.consumeVerifyLimit({
      ...params,
      recipient: params.token,
      purpose,
    });

    const key = this.otpKey(purpose, params.token);
    const rawRecord = await this.redisService.instance.get(key);

    if (!rawRecord) {
      throw new UnauthorizedException('OTP tidak valid atau sudah kedaluwarsa');
    }

    const record = parseOtpRecord(rawRecord);

    if (record.attemptsLeft <= 0) {
      await this.redisService.instance.del(key);
      throw new HttpException(
        'Percobaan OTP terlalu banyak',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    if (!safeHashEqual(record.hash, hashValue(otp))) {
      await this.persistRemainingAttempts(key, {
        ...record,
        attemptsLeft: record.attemptsLeft - 1,
      });
      throw new UnauthorizedException('OTP tidak valid atau sudah kedaluwarsa');
    }

    await this.redisService.instance.del(key);

    return {
      recipient: record.recipient,
      purpose: record.purpose,
    };
  }

  private async consumeRequestLimit(params: RequestOtpParams) {
    await Promise.all([
      this.rateLimitService.consume(
        {
          keyPrefix: `otp:${params.purpose}:request:recipient`,
          points: 5,
          durationSeconds: 5 * 60,
        },
        params.recipient,
      ),
      params.ipAddress
        ? this.rateLimitService.consume(
            {
              keyPrefix: `otp:${params.purpose}:request:ip`,
              points: 10,
              durationSeconds: 60,
            },
            params.ipAddress,
          )
        : Promise.resolve(),
    ]);
  }

  private async consumeVerifyLimit(params: RequestOtpParams) {
    await Promise.all([
      this.rateLimitService.consume(
        {
          keyPrefix: `otp:${params.purpose}:verify:recipient`,
          points: 10,
          durationSeconds: 5 * 60,
        },
        params.recipient,
      ),
      params.ipAddress
        ? this.rateLimitService.consume(
            {
              keyPrefix: `otp:${params.purpose}:verify:ip`,
              points: 20,
              durationSeconds: 60,
            },
            params.ipAddress,
          )
        : Promise.resolve(),
    ]);
  }

  private async persistRemainingAttempts(key: string, record: OtpRecord) {
    const ttl = await this.redisService.instance.pttl(key);

    if (ttl <= 0) {
      await this.redisService.instance.del(key);
      return;
    }

    await this.redisService.instance.set(
      key,
      JSON.stringify(record),
      'PX',
      ttl,
    );
  }

  private otpKey(purpose: string, recipient: string) {
    return `otp:${purpose}:${hashValue(recipient)}`;
  }
}
