import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../infrastruktur/prisma/prisma.service';
import { SYSTEM_ROLE_SEEDS } from '../access-control/access-control.utils';
import {
  rolePermissionSelect,
  mitraRolePermissionSelect,
  roleSelect,
} from './roles.constants';

@Injectable()
export class RolesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async ensureSystemRoles() {
    await this.prisma.$transaction(
      SYSTEM_ROLE_SEEDS.map((role) =>
        this.prisma.role.upsert({
          where: { code: role.code },
          update: {
            name: role.name,
            scope: role.scope,
            description: role.description,
            isSystem: role.isSystem,
            deletedAt: null,
          },
          create: {
            name: role.name,
            code: role.code,
            scope: role.scope,
            description: role.description,
            isSystem: role.isSystem,
          },
        }),
      ),
    );
  }

  createRole(data: Prisma.RoleCreateInput) {
    return this.prisma.role.create({
      data,
      select: roleSelect,
    });
  }

  async findRolesByScope(params?: {
    scope?: Prisma.RoleWhereInput['scope'];
    includeDeleted?: boolean;
    mitraId?: string;
  }) {
    const { scope, includeDeleted = false, mitraId } = params ?? {};
    const countSelect =
      scope === 'MITRA'
        ? {
            mitraUsers: {
              where: mitraId ? { mitraId } : undefined,
            },
            mitraRolePermissions: {
              where: mitraId ? { mitraId } : undefined,
            },
          }
        : {
            insidiaUsers: true,
            permissions: true,
          };
    return this.prisma.role.findMany({
      where: {
        scope,
        ...(includeDeleted ? {} : { deletedAt: null }),
      },
      orderBy: [{ scope: 'asc' }, { name: 'asc' }],
      select: {
        ...roleSelect,
        _count: {
          select: countSelect,
        },
      },
    });
  }

  async findRoleById(id: string) {
    return await this.prisma.role.findUnique({
      where: { id },
      select: roleSelect,
    });
  }

  async findRoleByCode(code: string) {
    return await this.prisma.role.findUnique({
      where: { code },
      select: roleSelect,
    });
  }

  async updateRole(id: string, data: Prisma.RoleUpdateInput) {
    return await this.prisma.role.update({
      where: { id },
      data,
      select: roleSelect,
    });
  }

  async findRolePermissions(roleId: string) {
    return await this.prisma.rolePermission.findMany({
      where: { roleId },
      orderBy: {
        permission: {
          name: 'asc',
        },
      },
      select: rolePermissionSelect,
    });
  }

  async findMitraRolePermissions(roleId: string, mitraId?: string) {
    return await this.prisma.mitraRolePermission.findMany({
      where: { mitraId, roleId },
      orderBy: {
        permission: {
          name: 'asc',
        },
      },
      select: mitraRolePermissionSelect,
    });
  }

  async addRolePermissions(roleId: string, permissionIds: string[]) {
    if (permissionIds.length === 0) {
      return await this.findRolePermissions(roleId);
    }

    await this.prisma.rolePermission.createMany({
      data: permissionIds.map((permissionId) => ({
        roleId,
        permissionId,
      })),
      skipDuplicates: true,
    });

    return await this.findRolePermissions(roleId);
  }

  async replaceRolePermissions(roleId: string, permissionIds: string[]) {
    return this.prisma.$transaction(async (tx) => {
      await tx.rolePermission.deleteMany({
        where: {
          roleId,
          ...(permissionIds.length > 0
            ? {
                permissionId: {
                  notIn: permissionIds,
                },
              }
            : {}),
        },
      });

      if (permissionIds.length > 0) {
        await tx.rolePermission.createMany({
          data: permissionIds.map((permissionId) => ({
            roleId,
            permissionId,
          })),
          skipDuplicates: true,
        });
      } else {
        await tx.rolePermission.deleteMany({
          where: { roleId },
        });
      }

      return tx.rolePermission.findMany({
        where: { roleId },
        orderBy: {
          permission: {
            name: 'asc',
          },
        },
        select: rolePermissionSelect,
      });
    });
  }

  async replaceMitraRolePermissions(
    mitraId: string,
    roleId: string,
    permissionIds: string[],
  ) {
    return this.prisma.$transaction(async (tx) => {
      await tx.mitraRolePermission.deleteMany({
        where: {
          mitraId,
          roleId,
          ...(permissionIds.length > 0
            ? {
                permissionId: {
                  notIn: permissionIds,
                },
              }
            : {}),
        },
      });

      if (permissionIds.length > 0) {
        await tx.mitraRolePermission.createMany({
          data: permissionIds.map((permissionId) => ({
            mitraId,
            roleId,
            permissionId,
          })),
          skipDuplicates: true,
        });
      } else {
        await tx.mitraRolePermission.deleteMany({
          where: { mitraId, roleId },
        });
      }

      return tx.mitraRolePermission.findMany({
        where: { mitraId, roleId },
        orderBy: {
          permission: {
            name: 'asc',
          },
        },
        select: mitraRolePermissionSelect,
      });
    });
  }

  async removeRolePermission(roleId: string, permissionId: string) {
    const result = await this.prisma.rolePermission.deleteMany({
      where: {
        roleId,
        permissionId,
      },
    });

    return result.count > 0;
  }
}
