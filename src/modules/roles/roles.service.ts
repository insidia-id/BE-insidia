import {
  ConflictException,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { Prisma, RoleScope } from '@prisma/client';
import { AssignRolePermissionsDto } from './dto/assign-role-permissions.dto';
import { PermissionsRepository } from '../permissions/permissions.repository';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RolesRepository } from './roles.repository';
import { RolesPermissionService } from './roles.permission';
import { AuthPayload } from '../auth/auth.types';
import { RolePermissionCodes } from './roles.constants';
import { permissionCodes } from '../permissions/permissions.constants';

@Injectable()
export class RolesService implements OnModuleInit {
  constructor(
    private readonly rolesRepository: RolesRepository,
    private readonly permissionsRepository: PermissionsRepository,
    private readonly rolesPermissionService: RolesPermissionService,
  ) {}

  async onModuleInit() {
    await this.rolesRepository.ensureSystemRoles();
  }

  async createRole(auth: AuthPayload, createRoleDto: CreateRoleDto) {
    const permissionCode =
      createRoleDto.scope === 'MITRA'
        ? RolePermissionCodes.createRoleMitra
        : RolePermissionCodes.createRoleInsidia;
    await this.rolesPermissionService.hasPermission(auth.sub, {
      permission: permissionCode,
      scope: createRoleDto.scope,
    });
    const existing = await this.rolesRepository.findRoleByCode(
      createRoleDto.code,
    );

    if (existing && !existing.deletedAt) {
      throw new ConflictException('Kode role sudah digunakan');
    }

    try {
      return await this.rolesRepository.createRole({
        name: createRoleDto.name,
        code: createRoleDto.code,
        scope: createRoleDto.scope,
        description: createRoleDto.description ?? null,
        isSystem: createRoleDto.isSystem ?? false,
      });
    } catch (error) {
      this.handlePrismaError(error, 'role');
    }
  }

  async findAllRoles(
    auth: AuthPayload,
    scope: RoleScope,
    includeDeleted = false,
    mitraId?: string,
  ) {
    if (scope === 'MITRA') {
      await this.rolesPermissionService.hasPermission(auth.sub, {
        permission: RolePermissionCodes.viewRoleMitra,
        scope,
        mitraId,
      });
    } else {
      await this.rolesPermissionService.hasPermission(auth.sub, {
        permission: RolePermissionCodes.viewRoleInsidia,
        scope,
      });
    }

    const res = await this.rolesRepository.findRoles({
      scope,
      includeDeleted,
      ...(scope === 'MITRA' && mitraId ? { mitraId } : {}),
    });

    console.log('Found roles with params', {
      scope,
      includeDeleted,
      mitraId: scope === 'MITRA' ? mitraId : undefined,
      resultsCount: JSON.stringify(res, null, 2),
    });
    return res;
  }

  async findRoleById(id: string) {
    const role = await this.rolesRepository.findRoleById(id);

    if (!role || role.deletedAt) {
      throw new NotFoundException('Role tidak ditemukan');
    }

    return role;
  }

  async updateRole(id: string, updateRoleDto: UpdateRoleDto) {
    await this.ensureRoleExists(id);

    if (updateRoleDto.code) {
      const existing = await this.rolesRepository.findRoleByCode(
        updateRoleDto.code,
      );

      if (existing && existing.id !== id && !existing.deletedAt) {
        throw new ConflictException('Kode role sudah digunakan');
      }
    }

    try {
      return await this.rolesRepository.updateRole(id, {
        ...(updateRoleDto.name !== undefined
          ? { name: updateRoleDto.name }
          : {}),
        ...(updateRoleDto.code !== undefined
          ? { code: updateRoleDto.code }
          : {}),
        ...(updateRoleDto.scope !== undefined
          ? { scope: updateRoleDto.scope }
          : {}),
        ...(updateRoleDto.description !== undefined
          ? { description: updateRoleDto.description ?? null }
          : {}),
        ...(updateRoleDto.isSystem !== undefined
          ? { isSystem: updateRoleDto.isSystem }
          : {}),
      });
    } catch (error) {
      this.handlePrismaError(error, 'role');
    }
  }

  async removeRole(id: string) {
    const role = await this.ensureRoleExists(id);

    if (role.isSystem) {
      throw new ConflictException('Role sistem tidak bisa dihapus');
    }

    if (role._count.insidiaUsers > 0 || role._count.mitraUsers > 0) {
      throw new ConflictException('Role masih dipakai oleh user');
    }

    await this.rolesRepository.updateRole(id, {
      deletedAt: new Date(),
    });

    return { message: 'Role berhasil dihapus' };
  }

  async findRolePermissions(roleId: string) {
    await this.ensureRoleExists(roleId);
    return this.rolesRepository.findRolePermissions(roleId);
  }

  async addRolePermissions(
    roleId: string,
    assignRolePermissionsDto: AssignRolePermissionsDto,
  ) {
    const role = await this.ensureRoleExists(roleId);
    await this.ensurePermissionsMatchScope(
      role.scope,
      assignRolePermissionsDto.permissionIds,
    );

    return this.rolesRepository.addRolePermissions(
      roleId,
      assignRolePermissionsDto.permissionIds,
    );
  }

  async replaceRolePermissions(
    auth: AuthPayload,
    roleId: string,
    assignRolePermissionsDto: AssignRolePermissionsDto,
  ) {
    console.log('Replacing role permissions with data:', {
      authSub: auth.sub,
      roleId,
      permissionIds: assignRolePermissionsDto.permissionIds,
    });
    const role = await this.ensureRoleExists(roleId);
    const isMitraRole = role.scope === 'MITRA';
    await this.ensurePermissionsMatchScope(
      role.scope,
      assignRolePermissionsDto.permissionIds,
    );
    await this.rolesPermissionService.hasPermission(
      auth.sub,
      isMitraRole
        ? {
            permission: permissionCodes.manageMitraPermissions,
            scope: 'MITRA',
          }
        : {
            permission: permissionCodes.manageInsidiaPermissions,
            scope: 'INSIDIA',
          },
    );
    return this.rolesRepository.replaceRolePermissions(
      roleId,
      assignRolePermissionsDto.permissionIds,
    );
  }

  async replaceMitraRolePermissions(
    auth: AuthPayload,
    mitraId: string,
    roleId: string,
    assignRolePermissionsDto: AssignRolePermissionsDto,
  ) {
    const role = await this.ensureRoleExists(roleId);

    if (role.scope !== 'MITRA') {
      throw new ConflictException(
        'Permission per mitra hanya bisa diterapkan pada role scope MITRA',
      );
    }

    await this.rolesPermissionService.hasPermission(auth.sub, {
      permission: permissionCodes.manageMitraPermissions,
      scope: 'MITRA',
      requireMitraContext: true,
      mitraId,
    });
    await this.ensurePermissionsMatchScope(
      role.scope,
      assignRolePermissionsDto.permissionIds,
    );

    return this.rolesRepository.replaceMitraRolePermissions(
      mitraId,
      roleId,
      assignRolePermissionsDto.permissionIds,
    );
  }

  async removeRolePermission(roleId: string, permissionId: string) {
    await this.ensureRoleExists(roleId);
    await this.ensurePermissionExists(permissionId);

    const removed = await this.rolesRepository.removeRolePermission(
      roleId,
      permissionId,
    );

    if (!removed) {
      throw new NotFoundException('Role permission tidak ditemukan');
    }

    return { message: 'Permission berhasil dilepas dari role' };
  }

  private async ensureRoleExists(id: string) {
    const role = await this.rolesRepository.findRoleById(id);

    if (!role || role.deletedAt) {
      throw new NotFoundException('Role tidak ditemukan');
    }

    return role;
  }

  private async ensurePermissionExists(id: string) {
    const permission = await this.permissionsRepository.findPermissionById(id);

    if (!permission) {
      throw new NotFoundException('Permission tidak ditemukan');
    }

    return permission;
  }

  private async ensurePermissionsMatchScope(
    roleScope: RoleScope,
    permissionIds: string[],
  ) {
    if (permissionIds.length === 0) {
      return;
    }

    const permissions =
      await this.permissionsRepository.findPermissionsByIds(permissionIds);
    console.log(
      `permissions for ids ${permissionIds}:`,
      `permissions`,
      permissions,
    );
    if (permissions.length !== permissionIds.length) {
      throw new NotFoundException('Sebagian permission tidak ditemukan');
    }

    const invalidPermission = permissions.find(
      (permission) => permission.module.scope !== roleScope,
    );

    if (invalidPermission) {
      throw new ConflictException(
        'Scope permission harus sama dengan scope role',
      );
    }
  }

  private handlePrismaError(error: unknown, resource: 'role'): never {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new ConflictException(`Kode ${resource} sudah digunakan`);
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      throw new NotFoundException('Role tidak ditemukan');
    }

    throw error;
  }
}
