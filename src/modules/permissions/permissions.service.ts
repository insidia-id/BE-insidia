import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, RoleScope } from '@prisma/client';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { PermissionsRepository } from './permissions.repository';
import { RolesPermissionService } from '../roles/roles.permission';
import { AuthPayload } from '../auth/auth.types';
import { PermissionsPolicy } from './permissions.policy';
import { permissionCodes } from './permissions.constants';

@Injectable()
export class PermissionsService {
  constructor(
    private readonly permissionsRepository: PermissionsRepository,
    private readonly rolesPermissionService: RolesPermissionService,
    private readonly permissionsPolicy: PermissionsPolicy,
  ) {}

  async createPermission(createPermissionDto: CreatePermissionDto) {
    try {
      return await this.permissionsRepository.createPermission({
        name: createPermissionDto.name,
        code: createPermissionDto.code,
        scope: createPermissionDto.scope,
        description: createPermissionDto.description ?? null,
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async findAllPermissions(
    auth: AuthPayload,
    scope: RoleScope,
    mitraId?: string,
  ) {
    scope === 'MITRA'
      ? await this.rolesPermissionService.hasAnyPermission(auth.sub, {
          permission: [
            permissionCodes.viewMitraPermissions,
            permissionCodes.manageMitraPermissions,
          ],
          scope,
          mitraId,
        })
      : await this.rolesPermissionService.hasPermission(auth.sub, {
          permission: permissionCodes.viewInsidiaPermissions,
          scope,
        });
    return this.permissionsRepository.findPermissions(scope);
  }

  async findPermissionById(auth: AuthPayload, id: string) {
    await this.rolesPermissionService.hasPermission(auth.sub, {
      permission: permissionCodes.viewMitraPermissions,
      scope: 'MITRA',
    });

    const permission = await this.permissionsRepository.findPermissionById(id);

    if (!permission) {
      throw new NotFoundException('Permission tidak ditemukan');
    }

    return permission;
  }

  async updatePermission(
    auth: AuthPayload,
    id: string,
    updatePermissionDto: UpdatePermissionDto,
  ) {
    await this.findPermissionById(auth, id);

    try {
      return await this.permissionsRepository.updatePermission(id, {
        ...(updatePermissionDto.name !== undefined
          ? {
              name: updatePermissionDto.name,
              code: updatePermissionDto.code,
            }
          : {}),
        ...(updatePermissionDto.scope !== undefined
          ? { scope: updatePermissionDto.scope }
          : {}),
        ...(updatePermissionDto.description !== undefined
          ? { description: updatePermissionDto.description ?? null }
          : {}),
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async removePermission(auth: AuthPayload, id: string) {
    await this.findPermissionById(auth, id);

    try {
      await this.permissionsRepository.deletePermission(id);
    } catch (error) {
      this.handlePrismaError(error);
    }

    return { message: 'Permission berhasil dihapus' };
  }

  private handlePrismaError(error: unknown): never {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new ConflictException('Kode permission sudah digunakan');
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      throw new NotFoundException('Permission tidak ditemukan');
    }

    throw error;
  }
}
