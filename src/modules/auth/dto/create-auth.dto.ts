import { z } from 'zod';

const emailSchema = z.string().trim().toLowerCase().email('Email tidak valid');

const optionalNullableStringSchema = z.preprocess(
  (value) => (value === '' ? null : value),
  z.string().trim().min(1).nullable().optional(),
);

const optionalDateSchema = z.preprocess(
  (value) => (value === '' || value === null ? undefined : value),
  z.coerce.date().optional(),
);

export const requestOtpSchema = z.object({
  email: emailSchema,
});

export const verifyOtpSchema = z.object({
  token: z.string().trim().min(1, 'Token tidak valid'),
  otp: z
    .string()
    .trim()
    .regex(/^\d{6}$/, 'OTP harus 6 digit'),
});

export const googleExchangeAccountSchema = z
  .object({
    type: z.string().trim().min(1).default('oauth'),
    provider: z.string().trim().min(1).default('google'),
    providerAccountId: z.string().trim().min(1).optional(),
    provider_account_id: z.string().trim().min(1).optional(),
    refresh_token: optionalNullableStringSchema,
    access_token: optionalNullableStringSchema,
    expires_at: z.number().int().nullable().optional(),
    token_type: optionalNullableStringSchema,
    scope: optionalNullableStringSchema,
    id_token: optionalNullableStringSchema,
    session_state: optionalNullableStringSchema,
  })
  .transform((account) => ({
    type: account.type,
    provider: account.provider,
    providerAccountId:
      account.providerAccountId ?? account.provider_account_id ?? '',
    refresh_token: account.refresh_token ?? null,
    access_token: account.access_token ?? null,
    expires_at: account.expires_at ?? null,
    token_type: account.token_type ?? null,
    scope: account.scope ?? null,
    id_token: account.id_token ?? null,
    session_state: account.session_state ?? null,
  }))
  .refine((account) => account.provider === 'google', {
    path: ['provider'],
    message: 'Provider Google tidak valid',
  })
  .refine((account) => account.providerAccountId.length > 0, {
    path: ['providerAccountId'],
    message: 'Provider account id wajib dikirim',
  });

export const googleExchangeSchema = z.object({
  email: emailSchema,
  name: optionalNullableStringSchema,
  image: optionalNullableStringSchema,
  emailVerified: optionalDateSchema,
  account: googleExchangeAccountSchema,
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().trim().min(1, 'Refresh token wajib dikirim'),
});

export type RequestOtpDto = z.infer<typeof requestOtpSchema>;
export type VerifyOtpDto = z.infer<typeof verifyOtpSchema>;
export type GoogleExchangeAccountDto = z.infer<
  typeof googleExchangeAccountSchema
>;
export type GoogleExchangeDto = z.infer<typeof googleExchangeSchema>;
export type RefreshTokenDto = z.infer<typeof refreshTokenSchema>;
