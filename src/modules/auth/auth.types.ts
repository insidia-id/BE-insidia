import { UserStatus } from '@prisma/client';

export type AuthPayload = {
  sub: string;
  email: string;
  role: string;
  permissions: string[];
  status: UserStatus;
  sessionId: string;
};
