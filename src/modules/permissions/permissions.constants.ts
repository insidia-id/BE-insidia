import { Prisma } from '@prisma/client';
export const permissionSelect = {
  id: true,
  name: true,
  moduleId: true,
  code: true,
  scope: true,
  description: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.PermissionSelect;
export const modulePermissionSelect = {
  id: true,
  module: true,
  description: true,
  createdAt: true,
  permissions: {
    select: permissionSelect,
  },
} satisfies Prisma.ModulePermissionSelect;

export const permissionCodes = {
  viewMitraPermissions: 'permissions.view.mitra',
  manageMitraPermissions: 'permissions.manage.mitra',
  viewInsidiaPermissions: 'permissions.view.insidia',
  manageInsidiaPermissions: 'permissions.manage.insidia',
};
