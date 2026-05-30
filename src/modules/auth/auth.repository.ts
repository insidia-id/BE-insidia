import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastruktur/prisma/prisma.service';
import {
  authSessionUserSelect,
  authUserStatusSelect,
  profileUserSelect,
  sessionSelect,
} from './auth.repository.types';
import type {
  CreateGoogleUserInput,
  CreateSessionInput,
  UpdateGoogleUserInput,
} from './auth.repository.types';
import type { CreateLoginEventInput, OAuthAccountInput } from './auth.types';

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
        insidiaRole: {
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

  createGoogleUser(input: CreateGoogleUserInput) {
    return this.prisma.user.create({
      data: {
        email: input.normalizedEmail,
        normalizedEmail: input.normalizedEmail,
        name: input.name,
        image: input.image,
        emailVerified: input.emailVerified,
        insidiaRole: {
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

  updateGoogleUser(id: string, data: UpdateGoogleUserInput) {
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

  createSession(input: CreateSessionInput) {
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

  getUserSelectById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: profileUserSelect,
    });
  }
  getStatusByUserId(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: sessionSelect,
    });
  }
}
