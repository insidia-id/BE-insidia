import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { RolesRepository } from './roles.repository';
import { UserRepository } from '../user/user.repository';
type hasPermissionContext = {
  scope: 'INSIDIA' | 'MITRA';
  permission: string;
  mitraId?: string;
  requireMitraContext?: boolean;
};
@Injectable()
export class RolesPermissionService {
  constructor(
    private readonly rolesRepository: RolesRepository,
    private readonly userRepository: UserRepository,
  ) {}
  async getEffectivePermissions(userId: string, context: hasPermissionContext) {
    const actor = await this.userRepository.findRoleByUserId(
      userId,
      context.mitraId,
    );
    console.log(
      `[GET EFFECTIVE PERMISSIONS] userId=${userId} scope=${context.scope} mitraId=${context.mitraId} actor=`,
      actor,
    );
    if (!actor) {
      throw new NotFoundException('User tidak ditemukan');
    }
    if (actor.insidiaRole?.role?.code === 'SUPER_ADMIN') {
      return {
        actor,
        permissions: ['*'],
      };
    }
    const actorMitraId = actor.mitraRoles?.mitraId ?? null;
    const mitraRole = actor.mitraRoles?.role;
    if (
      context.scope === 'MITRA' &&
      context.mitraId &&
      actorMitraId === context.mitraId &&
      mitraRole?.code === 'AKADEMIK'
    ) {
      return {
        actor,
        permissions: ['*'],
      };
    }
    if (
      context.scope === 'MITRA' &&
      context.requireMitraContext &&
      !context.mitraId
    ) {
      console.warn(
        '[PERMISSION WARNING] mitraId wajib dikirim untuk scope MITRA',
      );
      throw new ForbiddenException('mitraId wajib dikirim untuk scope MITRA');
    }
    const roleId =
      context.scope === 'INSIDIA'
        ? actor.insidiaRole?.role.id
        : actorMitraId === context.mitraId
          ? mitraRole?.id
          : null;
    if (!roleId) {
      throw new NotFoundException('Role tidak ditemukan');
    }

    const [globalPermissions, mitraPermissions] = await Promise.all([
      this.rolesRepository.findRolePermissions(roleId),
      context.scope === 'MITRA' && context.mitraId
        ? this.rolesRepository.findMitraRolePermissions(roleId, context.mitraId)
        : Promise.resolve([]),
    ]);

    const globalCodes = new Set(
      globalPermissions.map((item) => item.permission.code),
    );

    const mitraCodes = new Set(
      mitraPermissions.map((item) => item.permission.code),
    );

    let effectivePermissions: string[];

    if (context.scope === 'MITRA') {
      effectivePermissions = [...globalCodes].filter((code) =>
        mitraCodes.has(code),
      );
    } else {
      effectivePermissions = [...globalCodes];
    }
    console.log('[EFFECTIVE PERMISSION DEBUG]', {
      scope: context.scope,
      mitraId: context.mitraId,
      roleId,
      globalPermissions: [...globalCodes],
      mitraPermissions: [...mitraCodes],
      effectivePermissions,
    });
    return {
      actor,
      permissions: effectivePermissions,
    };
  }
  async hasPermission(userId: string, context: hasPermissionContext) {
    const result = await this.getEffectivePermissions(userId, context);
    console.log('[PERMISSION DEBUG]', {
      userId,
      scope: context.scope,
      mitraId: context.mitraId,
      actorRole: {
        insidiaRole: result.actor.insidiaRole?.role?.code,
        mitraRoles: result.actor.mitraRoles?.role.code,
        mitraId: result.actor.mitraRoles?.mitraId,
      },
      userPermissions: result.permissions,
      requiredPermission: context.permission,
      allowedPermissionsForEndpoint: [context.permission],
    });
    if (
      result.permissions[0] !== '*' &&
      !result.permissions.includes(context.permission)
    ) {
      console.log('[PERMISSION DENIED]', {
        reason: 'User tidak punya permission yang dibutuhkan',
        userPermissions: result.permissions,
        requiredPermission: context.permission,
        allowedPermissionsForEndpoint: [context.permission],
      });
      throw new ForbiddenException('anda tidak memiliki akses ke resource ini');
    }

    return result.actor;
  }

  async hasAnyPermission(
    userId: string,
    context: {
      permission: string[];
      scope: 'INSIDIA' | 'MITRA';
      mitraId?: string;
      requireMitraContext?: boolean;
    },
  ) {
    const result = await this.getEffectivePermissions(userId, {
      permission: context.scope,
      mitraId: context.mitraId,
      requireMitraContext: context.requireMitraContext,
      scope: context.scope,
    });
    console.log('[PERMISSION DEBUG]', {
      userId,
      scope: context.scope,
      mitraId: context.mitraId,
      actorRole: {
        insidiaRole: result.actor.insidiaRole?.role?.code,
        actorRole: {
          insidiaRole: result.actor.insidiaRole?.role?.code,
          mitraRoles: result.actor.mitraRoles?.role.code,
          mitraId: result.actor.mitraRoles?.mitraId,
        },
      },
      userPermissions: result.permissions,
      allowedPermissionsForEndpoint: context.permission,
    });
    if (result.permissions[0] === '*') {
      return result.actor;
    }

    const allowed = context.permission.some((code) =>
      result.permissions.includes(code),
    );

    if (!allowed) {
      console.log('[PERMISSION DENIED]', {
        reason: 'User tidak punya salah satu permission yang dibutuhkan',
        userPermissions: result.permissions,
        allowedPermissionsForEndpoint: context.permission,
      });

      throw new ForbiddenException('anda tidak memiliki akses ke resource ini');
    }

    return result.actor;
  }
}
