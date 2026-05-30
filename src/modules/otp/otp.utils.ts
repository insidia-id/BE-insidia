import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { createHash, timingSafeEqual } from 'crypto';
import type { OtpRecord } from './otp.types';

export function normalizeRecipient(value: string) {
  if (typeof value !== 'string') {
    throw new BadRequestException('Recipient OTP wajib dikirim');
  }

  const recipient = value.trim().toLowerCase();

  if (!recipient) {
    throw new BadRequestException('Recipient OTP wajib dikirim');
  }

  return recipient;
}

export function normalizePurpose(value: string) {
  if (typeof value !== 'string') {
    throw new BadRequestException('Purpose OTP wajib dikirim');
  }

  const purpose = value.trim().toLowerCase();

  if (!/^[a-z0-9:_-]+$/.test(purpose)) {
    throw new BadRequestException('Purpose OTP tidak valid');
  }

  return purpose;
}

export function normalizeOtp(value: string) {
  if (typeof value !== 'string') {
    throw new BadRequestException('OTP wajib dikirim');
  }

  const otp = value.trim();

  if (!/^\d{6}$/.test(otp)) {
    throw new BadRequestException('OTP harus 6 digit');
  }

  return otp;
}

export function parseOtpRecord(value: string): OtpRecord {
  try {
    const record = JSON.parse(value) as Partial<OtpRecord>;

    if (typeof record.hash !== 'string') {
      throw new Error('Invalid OTP hash');
    }

    return {
      recipient: normalizeRecipient(record.recipient ?? ''),
      purpose: normalizePurpose(record.purpose ?? ''),
      hash: record.hash,
      attemptsLeft:
        typeof record.attemptsLeft === 'number' ? record.attemptsLeft : 0,
    };
  } catch {
    throw new UnauthorizedException('OTP tidak valid atau sudah kedaluwarsa');
  }
}

export function hashValue(value: string) {
  return createHash('sha256').update(value).digest('hex');
}

export function safeHashEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left, 'hex');
  const rightBuffer = Buffer.from(right, 'hex');

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}
