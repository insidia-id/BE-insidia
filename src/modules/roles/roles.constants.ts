import { Prisma } from '@prisma/client';

export const rolePermissionSelect = {
  id: true,
  roleId: true,
  permissionId: true,
  permission: {
    select: {
      id: true,
      name: true,
      code: true,
      description: true,
      createdAt: true,
      updatedAt: true,
    },
  },
} satisfies Prisma.RolePermissionSelect;

export const mitraRolePermissionSelect = {
  id: true,
  mitraId: true,
  roleId: true,
  permissionId: true,
  permission: {
    select: {
      id: true,
      name: true,
      code: true,
      description: true,
      createdAt: true,
      updatedAt: true,
    },
  },
} satisfies Prisma.MitraRolePermissionSelect;

export const roleSelect = {
  id: true,
  name: true,
  code: true,
  scope: true,
  description: true,
  isSystem: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
} satisfies Prisma.RoleSelect;

export const RolePermissionCodes = {
  createRoleInsidia: 'roles.create.insidia',
  viewRoleInsidia: 'roles.view.insidia',
  updateRoleInsidia: 'roles.update.insidia',
  removeRoleInsidia: 'roles.remove.insidia',

  createRoleMitra: 'roles.create.mitra',
  viewRoleMitra: 'roles.view.mitra',
  updateRoleMitra: 'roles.update.mitra',
  removeRoleMitra: 'roles.remove.mitra',
};
