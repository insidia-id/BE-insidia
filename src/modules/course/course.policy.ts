import { ForbiddenException, Injectable } from '@nestjs/common';
import type { AuthPayload } from '../auth/auth.types';
import { actorRole } from '../user/user.types';
import { ActiveRoleCode } from '../../shared/session/active-mitra-session';

type MemberShipTarget = {
  isTeacher?: boolean;
  isStudent?: boolean;
};
type CourseAccessTarget = {
  creatorId: string | undefined;
};

@Injectable()
export class CoursePolicy {
  canManage(
    actorRole: ActiveRoleCode,
    target: CourseAccessTarget,
    auth?: AuthPayload,
  ) {
    if (
      actorRole.activeInsidiaRole === 'SUPER_ADMIN' ||
      actorRole.activeInsidiaRole === 'ADMIN'
    ) {
      return true;
    }

    if (
      actorRole.activeInsidiaRole === 'MENTOR' &&
      auth?.sub === target.creatorId
    ) {
      return true;
    }
    if (actorRole.activeMitraRole === 'GURU') {
      return true;
    }
    if (actorRole.activeMitraRole === 'AKADEMIK') {
      return true;
    }
    throw new ForbiddenException('Tidak memiliki akses ke course ini');
  }

  canManageInsidia(
    actor: ActiveRoleCode,
    target: CourseAccessTarget,
    auth: AuthPayload,
  ) {
    const roleCode = actor.activeInsidiaRole;

    if (roleCode === 'SUPER_ADMIN' || roleCode === 'ADMIN') {
      return true;
    }

    if (roleCode === 'MENTOR' && auth.sub === target.creatorId) {
      return true;
    }

    throw new ForbiddenException(
      'Tidak memiliki akses untuk mengelola module course ini',
    );
  }

  canManageMitra(
    actor: ActiveRoleCode,
    target: CourseAccessTarget,
    auth: AuthPayload,
  ) {
    const roleCode = actor.activeMitraRole;

    if (roleCode === 'SUPER_ADMIN' || roleCode === 'ADMIN') {
      return true;
    }
    if (roleCode === 'AKADEMIK') {
      return true;
    }
    if (auth.sub === target.creatorId) {
      return true;
    }

    throw new ForbiddenException(
      'Tidak memiliki akses untuk mengelola module ini',
    );
  }
  canView(
    actor: ActiveRoleCode,
    target: string | null | undefined,
    auth: AuthPayload,
    membership?: MemberShipTarget,
  ) {
    const roleCode = actor.activeInsidiaRole;

    if (auth.sub === target) {
      return true;
    }

    if (roleCode === 'SUPER_ADMIN' || roleCode === 'ADMIN') {
      return true;
    }
    if (roleCode === 'AKADEMIK') {
      return true;
    }
    if (membership?.isTeacher || membership?.isStudent) {
      return true;
    }
    throw new ForbiddenException(
      'Tidak memiliki akses untuk melihat module ini',
    );
  }
}
