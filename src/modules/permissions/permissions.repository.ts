import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../infrastruktur/prisma/prisma.service';

export const permissionSelect = {
  id: true,
  name: true,
  code: true,
  scope: true,
  description: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.PermissionSelect;

@Injectable()
export class PermissionsRepository {
  constructor(private readonly prisma: PrismaService) {}

  createPermission(data: Prisma.PermissionCreateInput) {
    return this.prisma.permission.create({
      data,
      select: permissionSelect,
    });
  }

  findPermissions(scope?: Prisma.PermissionWhereInput['scope']) {
    return this.prisma.permission.findMany({
      where: {
        scope,
      },
      orderBy: [{ scope: 'asc' }, { name: 'asc' }],
      select: permissionSelect,
    });
  }

  findPermissionById(id: string) {
    return this.prisma.permission.findUnique({
      where: { id },
      select: permissionSelect,
    });
  }

  findPermissionsByIds(ids: string[]) {
    return this.prisma.permission.findMany({
      where: {
        id: {
          in: ids,
        },
      },
      select: permissionSelect,
    });
  }

  updatePermission(id: string, data: Prisma.PermissionUpdateInput) {
    return this.prisma.permission.update({
      where: { id },
      data,
      select: permissionSelect,
    });
  }

  deletePermission(id: string) {
    return this.prisma.permission.delete({
      where: { id },
      select: permissionSelect,
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
}
