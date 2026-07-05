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
import { AuthenticatedRequest } from 'src/shared/guards/access-token.guard';
import { rolesPolicy } from './roles.policy';
import { requireActiveMitraId } from 'src/shared/session/active-mitra-session';
@Injectable()
export class RolesService implements OnModuleInit {
  constructor(
    private readonly rolesRepository: RolesRepository,
    private readonly permissionsRepository: PermissionsRepository,
    private readonly rolesPermissionService: RolesPermissionService,
    private readonly rolesPolicy: rolesPolicy,
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
    request: AuthenticatedRequest,
    scope: RoleScope,
    includeDeleted = false,
    mitraId?: string,
  ) {
    let targetMitraId: string | undefined;
    const isMitraScope = scope === 'MITRA';

    const actor = await this.rolesPermissionService.hasPermission(
      request.auth.sub,
      {
        permission: isMitraScope
          ? RolePermissionCodes.viewRoleMitra
          : RolePermissionCodes.viewRoleInsidia,
        scope,
        mitraId: isMitraScope
          ? (request.session.activeMitraId ?? mitraId)
          : undefined,
      },
    );
    if (isMitraScope) {
      if (actor?.insidiaRole?.role.code === 'SUPER_ADMIN') {
        targetMitraId = mitraId;
      } else {
        targetMitraId = requireActiveMitraId(request);
      }
    }
    this.rolesPolicy.canManageMitra(mitraId ?? '', actor);

    const res = await this.rolesRepository.findRolesByScope({
      scope,
      includeDeleted,
      mitraId: targetMitraId,
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
    request: AuthenticatedRequest,
    roleId: string,
    assignRolePermissionsDto: AssignRolePermissionsDto,
  ) {
    const role = await this.ensureRoleExists(roleId);
    const isMitraRole = role.scope === 'MITRA';

    await this.ensurePermissionsMatchScope(
      role.scope,
      assignRolePermissionsDto.permissionIds,
    );

    await this.rolesPermissionService.hasPermission(
      request.auth.sub,
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

  async findRoleMitraPermissions(
    request: AuthenticatedRequest,
    roleId: string,
    mitraId?: string,
  ) {
    await this.ensureRoleExists(roleId);
    await this.rolesPermissionService.hasPermission(request.auth.sub, {
      permission: permissionCodes.viewMitraPermissions,
      scope: 'MITRA',
      requireMitraContext: true,
      mitraId: request.session.activeMitraId ?? undefined,
    });
    const res = await this.rolesRepository.findMitraRolePermissions(
      roleId,
      mitraId,
    );
    return res;
  }

  async replaceMitraRolePermissions(
    request: AuthenticatedRequest,
    roleId: string,
    assignRolePermissionsDto: AssignRolePermissionsDto,
    mitraId?: string,
  ) {
    const role = await this.ensureRoleExists(roleId);

    if (role.scope !== 'MITRA') {
      throw new ConflictException(
        'Permission per mitra hanya bisa diterapkan pada role scope MITRA',
      );
    }

    await this.rolesPermissionService.hasPermission(request.auth.sub, {
      permission: permissionCodes.manageMitraPermissions,
      scope: 'MITRA',
      requireMitraContext: true,
      mitraId: mitraId ?? request.session.activeMitraId ?? undefined,
    });

    await this.ensurePermissionsMatchScope(
      role.scope,
      assignRolePermissionsDto.permissionIds,
    );

    return this.rolesRepository.replaceMitraRolePermissions(
      mitraId ?? request.session.activeMitraId ?? '',
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
