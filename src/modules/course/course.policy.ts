import { ForbiddenException, Injectable } from '@nestjs/common';
import type { AuthPayload } from '../auth/auth.types';
import { actorRole } from '../user/user.types';
type CourseAccessTarget = {
  creatorId: string;
};

@Injectable()
export class CoursePolicy {
  canManage(
    actorRole: actorRole,
    target: CourseAccessTarget,
    auth?: AuthPayload,
  ) {
    if (
      actorRole.insidiaRole?.role.code === 'SUPER_ADMIN' ||
      actorRole.insidiaRole?.role.code === 'ADMIN'
    ) {
      return true;
    }

    if (
      actorRole.insidiaRole?.role.code === 'MENTOR' &&
      auth?.sub === target.creatorId
    ) {
      return true;
    }
    if (actorRole.mitraRoles?.role.code === 'AKADEMIK') {
      return true;
    }

    throw new ForbiddenException('Tidak memiliki akses ke course ini');
  }
}
