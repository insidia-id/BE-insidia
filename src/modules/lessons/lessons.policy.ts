import { ForbiddenException, Injectable } from '@nestjs/common';
import type { AuthPayload } from '../auth/auth.types';
import type { actorRole } from '../user/user.types';

type InsidiaTarget = {
  creatorId: string;
};

type MitraTarget = {
  teacherId: string;
};

@Injectable()
export class LessonsPolicy {
  canManageInsidia(actor: actorRole, target: InsidiaTarget, auth: AuthPayload) {
    const roleCode = actor.insidiaRole?.role.code;

    if (roleCode === 'SUPER_ADMIN' || roleCode === 'ADMIN') {
      return true;
    }

    if (roleCode === 'MENTOR' && auth.sub === target.creatorId) {
      return true;
    }

    throw new ForbiddenException(
      'Tidak memiliki akses untuk mengelola lesson ini',
    );
  }

  canManageMitra(actor: actorRole, target: MitraTarget, auth: AuthPayload) {
    if (auth.sub === target.teacherId) {
      return true;
    }

    const hasAkademikRole = actor.mitraRoles?.some(
      (r) => r.role.code === 'AKADEMIK',
    );

    if (hasAkademikRole) {
      return true;
    }

    throw new ForbiddenException(
      'Tidak memiliki akses untuk mengelola lesson ini',
    );
  }
}
