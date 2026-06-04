import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../infrastruktur/prisma/prisma.service';
import { userRole } from '../user/user.constants';
import {
  modulePermissionSelect,
  permissionSelect,
} from './permissions.constants';
import { BulkPermissionDto } from './dto/create-permission.dto';

@Injectable()
export class PermissionsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findActorByUserId(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        insidiaRole: userRole.insidiaRole,
        mitraRoles: userRole.mitraRoles,
      },
    });
  }

  async createModulePermission(data: Prisma.ModulePermissionCreateInput) {
    return this.prisma.modulePermission.create({
      data,
    });
  }
  async getModulePermissions(
    scope?: Prisma.ModulePermissionWhereInput['scope'],
  ) {
    return this.prisma.modulePermission.findMany({
      where: {
        scope,
      },
      orderBy: {
        module: 'asc',
      },
      select: {
        ...modulePermissionSelect,
      },
    });
  }
  async updateModulePermission(
    id: string,
    data: Prisma.ModulePermissionUpdateInput,
  ) {
    return this.prisma.modulePermission.update({
      where: { id },
      data,
      select: modulePermissionSelect,
    });
  }
  async removeModulePermission(id: string) {
    return this.prisma.modulePermission.delete({
      where: { id },
      select: modulePermissionSelect,
    });
  }
  async getModulePermissionById(id: string) {
    return this.prisma.modulePermission.findUnique({
      where: { id },
      select: modulePermissionSelect,
    });
  }
  findPermissionsByIds(permissionIds: string[]) {
    return this.prisma.permission.findMany({
      where: {
        id: {
          in: permissionIds,
        },
      },
      select: {
        id: true,
        code: true,
        module: {
          select: {
            id: true,
            scope: true,
            module: true,
          },
        },
      },
    });
  }
  findModulePermissionByModules(modules: string[]) {
    return this.prisma.modulePermission.findMany({
      where: {
        module: {
          in: modules,
        },
      },
      select: {
        id: true,
        module: true,
        scope: true,
      },
    });
  }

  async createPermission(data: Prisma.PermissionCreateInput) {
    return await this.prisma.permission.create({
      data,
      select: permissionSelect,
    });
  }

  async findPermissionById(id: string) {
    return this.prisma.permission.findUnique({
      where: { id },
      select: permissionSelect,
    });
  }

  async updatePermission(id: string, data: Prisma.PermissionUpdateInput) {
    return this.prisma.permission.update({
      where: { id },
      data,
      select: permissionSelect,
    });
  }

  async deletePermission(id: string) {
    return this.prisma.permission.delete({
      where: { id },
      select: permissionSelect,
    });
  }
  findPermissionsByCodes(codes: string[]) {
    return this.prisma.permission.findMany({
      where: {
        code: {
          in: codes,
        },
      },
      select: {
        id: true,
        code: true,
      },
    });
  }
  hasPermission(roleId: string, permissionId: string) {
    return this.prisma.rolePermission.findUnique({
      where: {
        roleId_permissionId: {
          roleId,
          permissionId,
        },
      },
    });
  }
  async upsertModulePermission(data: BulkPermissionDto) {
    return this.prisma.$transaction(async (tx) => {
      const modulePermission = await tx.modulePermission.upsert({
        where: {
          module_scope: {
            module: data.module.trim(),
            scope: data.scope,
          },
        },
        create: {
          module: data.module.trim(),
          scope: data.scope,
          description: data.moduleDescription?.trim() ?? null,
        },
        update: {
          description: data.moduleDescription?.trim() ?? null,
        },
      });

      return tx.permission.upsert({
        where: {
          code: data.permissionCode.trim(),
        },
        create: {
          name: data.permissionName.trim(),
          code: data.permissionCode.trim(),
          description: data.permissionDescription?.trim() ?? null,
          moduleId: modulePermission.id,
        },
        update: {
          name: data.permissionName.trim(),
          description: data.permissionDescription?.trim() ?? null,
          moduleId: modulePermission.id,
        },
      });
    });
  }
}
