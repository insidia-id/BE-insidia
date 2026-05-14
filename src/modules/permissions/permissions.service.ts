import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, RoleScope } from '@prisma/client';
import {
  CreatePermissionDto,
  normalizePermissionCode,
} from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { PermissionsRepository } from './permissions.repository';

@Injectable()
export class PermissionsService {
  constructor(private readonly permissionsRepository: PermissionsRepository) {}

  async createPermission(createPermissionDto: CreatePermissionDto) {
    const code = normalizePermissionCode(createPermissionDto.name);
    try {
      return await this.permissionsRepository.createPermission({
        name: createPermissionDto.name,
        code: code,
        scope: createPermissionDto.scope,
        description: createPermissionDto.description ?? null,
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  findAllPermissions(scope?: RoleScope) {
    return this.permissionsRepository.findPermissions(scope);
  }

  async findPermissionById(id: string) {
    const permission = await this.permissionsRepository.findPermissionById(id);

    if (!permission) {
      throw new NotFoundException('Permission tidak ditemukan');
    }

    return permission;
  }

  async updatePermission(id: string, updatePermissionDto: UpdatePermissionDto) {
    await this.findPermissionById(id);

    try {
      return await this.permissionsRepository.updatePermission(id, {
        ...(updatePermissionDto.name !== undefined
          ? {
              name: updatePermissionDto.name,
              code: normalizePermissionCode(updatePermissionDto.name),
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

  async removePermission(id: string) {
    await this.findPermissionById(id);

    try {
      await this.permissionsRepository.deletePermission(id);
    } catch (error) {
      this.handlePrismaError(error);
    }

    return { message: 'Permission berhasil dihapus' };
  }
  async hasPermission(roleId: string, permissionId: string) {
    const rolePermission = await this.permissionsRepository.hasPermission(
      roleId,
      permissionId,
    );
    if (!rolePermission) {
      throw new NotFoundException('Permission tidak ditemukan untuk role ini');
    }
    return { message: 'Role memiliki permission ini' };
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
