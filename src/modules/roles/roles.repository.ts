import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../infrastruktur/prisma/prisma.service';
import { SYSTEM_ROLE_SEEDS } from '../access-control/access-control.utils';

const rolePermissionSelect = {
  id: true,
  roleId: true,
  permissionId: true,
  permission: {
    select: {
      id: true,
      name: true,
      code: true,
      scope: true,
      description: true,
      createdAt: true,
      updatedAt: true,
    },
  },
} satisfies Prisma.RolePermissionSelect;
const mitraRolePermissionSelect = {
  id: true,
  mitraId: true,
  roleId: true,
  permissionId: true,
  permission: {
    select: {
      id: true,
      name: true,
      code: true,
      scope: true,
      description: true,
      createdAt: true,
      updatedAt: true,
    },
  },
} satisfies Prisma.MitraRolePermissionSelect;
const roleSelect = {
  id: true,
  name: true,
  code: true,
  scope: true,
  description: true,
  isSystem: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
  permissions: {
    select: rolePermissionSelect,
  },
  _count: {
    select: {
      permissions: true,
      insidiaUsers: true,
      mitraUsers: true,
    },
  },
} satisfies Prisma.RoleSelect;

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

  async findRoles(params?: {
    scope?: Prisma.RoleWhereInput['scope'];
    includeDeleted?: boolean;
    mitraId?: string;
  }) {
    const { mitraId } = params ?? {};
    const roles = await this.findRolesByScope(params);

    if (!mitraId) {
      return roles;
    }

    return roles.map((role) => {
      const { mitraRolePermissions, ...rest } = role as typeof role & {
        mitraRolePermissions: Array<any>;
      };
      const scopedPermissions = mitraRolePermissions as Array<any>;

      return {
        ...rest,
        permissions: scopedPermissions.map(
          ({ id, roleId, permissionId, permission }) => ({
            id,
            roleId,
            permissionId,
            permission,
          }),
        ),
        _count: {
          ...role._count,
          permissions: scopedPermissions.length,
        },
      };
    });
  }

  findRoleById(id: string) {
    return this.prisma.role.findUnique({
      where: { id },
      select: roleSelect,
    });
  }

  findRoleByCode(code: string) {
    return this.prisma.role.findUnique({
      where: { code },
      select: roleSelect,
    });
  }

  updateRole(id: string, data: Prisma.RoleUpdateInput) {
    return this.prisma.role.update({
      where: { id },
      data,
      select: roleSelect,
    });
  }

  findRolePermissions(roleId: string) {
    return this.prisma.rolePermission.findMany({
      where: { roleId },
      orderBy: {
        permission: {
          name: 'asc',
        },
      },
      select: rolePermissionSelect,
    });
  }
  findMitraRolePermissions(roleId: string, mitraId?: string) {
    return this.prisma.mitraRolePermission.findMany({
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
      return this.findRolePermissions(roleId);
    }

    await this.prisma.rolePermission.createMany({
      data: permissionIds.map((permissionId) => ({
        roleId,
        permissionId,
      })),
      skipDuplicates: true,
    });

    return this.findRolePermissions(roleId);
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

  private findRolesByScope(params?: {
    scope?: Prisma.RoleWhereInput['scope'];
    includeDeleted?: boolean;
    mitraId?: string;
  }) {
    const { scope, includeDeleted = false, mitraId } = params ?? {};

    return this.prisma.role.findMany({
      where: {
        scope,
        ...(includeDeleted ? {} : { deletedAt: null }),
      },
      orderBy: [{ scope: 'asc' }, { name: 'asc' }],
      select: {
        ...roleSelect,
        ...(mitraId
          ? {
              mitraRolePermissions: {
                where: { mitraId },
                orderBy: {
                  permission: {
                    name: 'asc',
                  },
                },
                select: mitraRolePermissionSelect,
              },
            }
          : {}),
      },
    });
  }
}
