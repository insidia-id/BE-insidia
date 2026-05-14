import { ForbiddenException, Injectable } from '@nestjs/common';
import type { AuthPayload } from '../auth/auth.types';

const adminAllowedTargetRoleCodes = new Set(['USER', 'MENTOR']);
type CreateUserPolicyParams = {
  targetRoleCode: string | null;
  targetScope: 'PLATFORM' | 'MITRA';
};
@Injectable()
export class UserPolicy {
  canCreate(auth: AuthPayload, params: CreateUserPolicyParams) {
    const { targetRoleCode, targetScope } = params;

    if (auth.role === 'SUPER_ADMIN') {
      return true;
    }

    if (auth.role === 'ADMIN') {
      if (targetRoleCode && adminAllowedTargetRoleCodes.has(targetRoleCode)) {
        return true;
      }

      throw new ForbiddenException(
        'Admin tidak bisa manage admin dan super admin',
      );
    }

    throw new ForbiddenException('Tidak memiliki izin membuat user');
  }

  canView(auth: AuthPayload, targetRoleCode: string | null) {
    if (auth.role === 'SUPER_ADMIN') {
      return true;
    }

    if (auth.role === 'ADMIN') {
      if (targetRoleCode && adminAllowedTargetRoleCodes.has(targetRoleCode)) {
        return true;
      }

      throw new ForbiddenException(
        'Admin tidak bisa melihat admin dan super admin',
      );
    }

    throw new ForbiddenException('Tidak memiliki izin melihat user');
  }

  canUpdate(auth: AuthPayload, params: CreateUserPolicyParams) {
    const { targetRoleCode, targetScope } = params;

    if (auth.role === 'SUPER_ADMIN') {
      return true;
    }

    if (auth.role === 'ADMIN') {
      if (targetRoleCode && adminAllowedTargetRoleCodes.has(targetRoleCode)) {
        return true;
      }

      throw new ForbiddenException(
        'Admin tidak bisa mengupdate admin dan super admin',
      );
    }

    throw new ForbiddenException('Tidak memiliki izin mengupdate user');
  }
}
