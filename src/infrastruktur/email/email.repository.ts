import nodemailer from 'nodemailer';
import { Resend } from 'resend';
import { ServerClient } from 'postmark';

export const sendWithNodemailer = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const resend = new Resend(process.env.RESEND_API_KEY);

export const clientPostmark = new ServerClient(
  process.env.POSTMARK_SERVER_TOKEN!,
);
