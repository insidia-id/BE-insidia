import type { LoginEventProvider, UserStatus } from '@prisma/client';

export type AccessTokenPayload = {
  type: 'access';
  sub: string;
  email: string;
  role: string;
  permissions: string[];
  status: UserStatus;
  sessionId: string;
  iat?: number;
  exp?: number;
};

export type RefreshTokenPayload = {
  type: 'refresh';
  sub: string;
  sessionId: string;
  tokenVersion: number;
  iat?: number;
  exp?: number;
};

export type JwtPayload = AccessTokenPayload | RefreshTokenPayload;

export type AuthPayload = AccessTokenPayload;

export type AuthUserResponse = {
  id: string;
  email: string;
  emailVerified: Date | null;
  name: string | null;
  status: UserStatus;
  image: string | null;
  role: string | null;
  permissions: string[];
};

export type AuthResponse = {
  user: AuthUserResponse;
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresInSeconds: number;
  refreshTokenExpiresInSeconds: number;
};

export type RequestOtpLoginResponse = {
  token: string;
  expiresInSeconds: number;
  devOtp?: string;
};

export type OAuthAccountInput = {
  type: string;
  provider: string;
  providerAccountId: string;
  refresh_token: string | null;
  access_token: string | null;
  expires_at: number | null;
  token_type: string | null;
  scope: string | null;
  id_token: string | null;
  session_state: string | null;
};

export type CreateLoginEventInput = {
  userId: string | null;
  email: string;
  provider: LoginEventProvider;
  success: boolean;
  reason: string;
  ipAddress: string;
  userAgent?: string;
};
