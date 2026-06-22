import { ForbiddenException, Injectable } from '@nestjs/common';
import type { AuthPayload } from '../auth/auth.types';
import {
  adminAllowedTargetRoleCodes,
  AkademikAllowedTargetRoleCodes,
} from './user.constants';
import type { actorRole, UserPolicyParams } from './user.types';
@Injectable()
export class UserPolicy {
  constructor() {}
  canCreate(
    actorRole: actorRole,
    params: UserPolicyParams,
    mitraId?: string | null,
  ) {
    const { targetRoleCode } = params;
    const mitraRoleCodes = actorRole.mitraRoles?.find(
      (r) => r.mitraId === mitraId,
    )?.role.code;
    if (actorRole.insidiaRole?.role.code === 'SUPER_ADMIN') {
      return true;
    }

    if (actorRole.insidiaRole?.role.code === 'ADMIN') {
      if (targetRoleCode && adminAllowedTargetRoleCodes.has(targetRoleCode)) {
        return true;
      }

      throw new ForbiddenException(
        'Admin tidak bisa manage admin dan super admin',
      );
    }
    if (mitraRoleCodes === 'AKADEMIK') {
      if (
        targetRoleCode &&
        AkademikAllowedTargetRoleCodes.has(targetRoleCode)
      ) {
        return true;
      }

      throw new ForbiddenException(
        'Akademik tidak bisa manage role di luar murid, guru, dan wali murid',
      );
    }
    throw new ForbiddenException('Tidak memiliki izin membuat user');
  }

  canView(
    actorRole: actorRole,
    targetRoleCode: string | null,
    mitraId: string | null,
    scope: 'INSIDIA' | 'MITRA',
  ) {
    const mitraRoleCodes = actorRole.mitraRoles?.find(
      (r) => r.mitraId === mitraId,
    )?.role.code;

    if (actorRole.insidiaRole?.role.code === 'SUPER_ADMIN') {
      return true;
    }

    if (actorRole.insidiaRole?.role.code === 'ADMIN') {
      if (targetRoleCode && adminAllowedTargetRoleCodes.has(targetRoleCode)) {
        return true;
      }

      throw new ForbiddenException(
        'Admin tidak bisa melihat admin dan super admin',
      );
    }

    if (mitraRoleCodes === 'AKADEMIK') {
      if (
        targetRoleCode &&
        AkademikAllowedTargetRoleCodes.has(targetRoleCode)
      ) {
        return true;
      }

      throw new ForbiddenException(
        'Akademik tidak bisa manage role di luar murid, guru, dan wali murid',
      );
    }
    throw new ForbiddenException('Tidak memiliki izin melihat user');
  }
  canManageMitraUser(targetMitraId: string, actorRole?: actorRole) {
    if (actorRole?.insidiaRole?.role.code === 'SUPER_ADMIN') {
      return true;
    }

    if (actorRole?.insidiaRole?.role.code === 'ADMIN') {
      return true;
    }
    if (actorRole?.mitraRoles?.find((r) => r.mitraId === targetMitraId)) {
      return true;
    }
    throw new ForbiddenException('Tidak memiliki izin mengelola user mitra');
  }
  canUpdate(
    actorRole: actorRole,
    params: UserPolicyParams,
    mitraId: string | null,
  ) {
    const { targetRoleCode } = params;

    if (actorRole.insidiaRole?.role.code === 'SUPER_ADMIN') {
      return true;
    }

    if (actorRole.insidiaRole?.role.code === 'ADMIN') {
      if (targetRoleCode && adminAllowedTargetRoleCodes.has(targetRoleCode)) {
        return true;
      }

      throw new ForbiddenException(
        'Admin tidak bisa mengupdate admin dan super admin',
      );
    }
    const mitraRoleCodes = this.mitraRoleCode(actorRole, mitraId);
    if (mitraRoleCodes === 'AKADEMIK') {
      if (
        targetRoleCode &&
        AkademikAllowedTargetRoleCodes.has(targetRoleCode)
      ) {
        return true;
      }

      throw new ForbiddenException(
        'Akademik tidak bisa manage role di luar murid, guru, dan wali murid',
      );
    }
    throw new ForbiddenException('Tidak memiliki izin mengupdate user');
  }
  mitraRoleCode(actorRole: actorRole, mitraId: string | null) {
    return actorRole.mitraRoles?.find((r) => r.mitraId === mitraId)?.role.code;
  }
}
