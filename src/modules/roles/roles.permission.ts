import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { RolesRepository } from './roles.repository';
import { UserRepository } from '../user/user.repository';

@Injectable()
export class RolesPermissionService {
  constructor(
    private readonly rolesRepository: RolesRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async hasPermission(
    userId: string,
    permissionCode: string,
    scope: 'PLATFORM' | 'MITRA',
  ) {
    const user = await this.userRepository.findRoleByUserId(userId);

    if (user?.platformRole?.role?.code === 'SUPER_ADMIN') {
      return true;
    }
    if (!user) {
      throw new NotFoundException('User tidak ditemukan');
    }
    const roleId =
      scope === 'PLATFORM'
        ? user.platformRole?.role.id
        : user.mitraRoles?.[0]?.role.id;
    if (!roleId) {
      throw new NotFoundException('Role tidak ditemukan');
    }

    const rolePermissions =
      await this.rolesRepository.findRolePermissions(roleId);

    const allowed = rolePermissions.some(
      (item) =>
        item.permission.code === permissionCode &&
        item.permission.scope === scope,
    );

    if (!allowed) {
      throw new ForbiddenException('anda tidak memiliki akses ke resource ini');
    }

    return true;
  }
}
