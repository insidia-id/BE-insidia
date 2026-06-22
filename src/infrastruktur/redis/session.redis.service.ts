import { Injectable } from '@nestjs/common';
import { RedisService } from './redis.service';
import { UserRepository } from 'src/modules/user/user.repository';
import { UserSession } from 'src/modules/auth/auth.types';
import { actorRole } from 'src/modules/user/user.types';
@Injectable()
export class SessionRedisService {
  constructor(
    private readonly redis: RedisService,
    private readonly userRepository: UserRepository,
  ) {}

  private key(userId: string) {
    return `session:user:${userId}`;
  }

  async get(userId: string): Promise<UserSession | null> {
    const data = await this.redis.instance.get(this.key(userId));
    return data ? JSON.parse(data) : null;
  }

  async set(userId: string, session: UserSession, ttlSec = 86400) {
    return this.redis.instance.set(
      this.key(userId),
      JSON.stringify(session),
      'EX',
      ttlSec,
    );
  }

  async patch(userId: string, partial: Partial<UserSession>) {
    const session = await this.get(userId);
    if (!session) return null;

    const updated = {
      ...session,
      ...partial,
    };

    await this.set(userId, updated);
    return updated;
  }

  async delete(userId: string) {
    return this.redis.instance.del(this.key(userId));
  }
  async validateSession(userId: string, user: actorRole) {
    const session = await this.get(userId);

    if (!session) return null;

    const actorType = this.getActorType(user);
    if (actorType === 'INSIDIA') {
      return session;
    }
    const stillValid = await this.userRepository.findUserMitraRoleByMitraId(
      userId,
      session.activeMitraId!,
    );

    if (!stillValid) {
      await this.delete(userId);
      return null;
    }

    return session;
  }
  getActorType(user: actorRole) {
    if (user.insidiaRole) return 'INSIDIA';
    if (user.mitraRoles?.length) return 'MITRA';
    return 'INSIDIA';
  }
}
