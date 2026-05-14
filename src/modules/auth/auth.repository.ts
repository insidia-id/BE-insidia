import { Injectable } from '@nestjs/common';
import type { LoginEventProvider, Prisma } from '@prisma/client';
import { PrismaService } from '../../infrastruktur/prisma/prisma.service';

const authPermissionSelect = {
  code: true,
} satisfies Prisma.PermissionSelect;

const authSessionUserSelect = {
  id: true,
  email: true,
  emailVerified: true,
  name: true,
  status: true,
  image: true,
  platformRole: {
    select: {
      role: {
        select: {
          code: true,
          permissions: {
            select: {
              permission: {
                select: authPermissionSelect,
              },
            },
          },
        },
      },
    },
  },
} satisfies Prisma.UserSelect;

const authUserStatusSelect = {
  id: true,
  status: true,
} satisfies Prisma.UserSelect;

export type SessionUser = Prisma.UserGetPayload<{
  select: typeof authSessionUserSelect;
}>;

export type AuthUserStatus = Prisma.UserGetPayload<{
  select: typeof authUserStatusSelect;
}>;

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

@Injectable()
export class AuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  findUserStatusByNormalizedEmail(normalizedEmail: string) {
    return this.prisma.user.findUnique({
      where: { normalizedEmail },
      select: authUserStatusSelect,
    });
  }

  findUserByNormalizedEmail(normalizedEmail: string) {
    return this.prisma.user.findUnique({
      where: { normalizedEmail },
      select: authSessionUserSelect,
    });
  }

  restoreUserByEmail(normalizedEmail: string) {
    return this.prisma.user.updateMany({
      where: { normalizedEmail, deletedAt: { not: null } },
      data: { status: 'ACTIVE', deletedAt: null },
    });
  }

  findUserById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: authSessionUserSelect,
    });
  }

  createEmailUser(normalizedEmail: string) {
    return this.prisma.user.create({
      data: {
        email: normalizedEmail,
        normalizedEmail,
        platformRole: {
          create: {
            role: {
              connect: {
                code: 'USER',
              },
            },
          },
        },
      },
      select: authSessionUserSelect,
    });
  }

  createGoogleUser(input: {
    normalizedEmail: string;
    name?: string | null;
    image?: string | null;
    emailVerified?: Date | null;
  }) {
    return this.prisma.user.create({
      data: {
        email: input.normalizedEmail,
        normalizedEmail: input.normalizedEmail,
        name: input.name,
        image: input.image,
        emailVerified: input.emailVerified,
        platformRole: {
          create: {
            role: {
              connect: {
                code: 'USER',
              },
            },
          },
        },
      },
      select: authSessionUserSelect,
    });
  }

  updateGoogleUser(
    id: string,
    data: Pick<Prisma.UserUpdateInput, 'name' | 'image' | 'emailVerified'>,
  ) {
    return this.prisma.user.update({
      where: { id },
      data,
      select: authSessionUserSelect,
    });
  }

  upsertOAuthAccount(userId: string, account: OAuthAccountInput) {
    return this.prisma.account.upsert({
      where: {
        provider_providerAccountId: {
          provider: account.provider,
          providerAccountId: account.providerAccountId,
        },
      },
      create: {
        userId,
        ...account,
      },
      update: {
        userId,
        type: account.type,
        refresh_token: account.refresh_token,
        access_token: account.access_token,
        expires_at: account.expires_at,
        token_type: account.token_type,
        scope: account.scope,
        id_token: account.id_token,
        session_state: account.session_state,
      },
    });
  }

  createSession(input: {
    id: string;
    userId: string;
    refreshTokenHash: string;
    tokenVersion: number;
    ipAddress: string;
    userAgent?: string;
    expiresAt: Date;
  }) {
    return this.prisma.authSession.create({
      data: input,
    });
  }

  findSessionById(id: string) {
    return this.prisma.authSession.findUnique({
      where: { id },
    });
  }

  async deleteSession(id: string) {
    await this.prisma.authSession
      .delete({
        where: { id },
      })
      .catch(() => undefined);
  }

  createLoginEvent(input: CreateLoginEventInput) {
    return this.prisma.loginEvent.create({
      data: input,
    });
  }
}
