import { Prisma } from '@prisma/client';

export const permissionSelect = {
  id: true,
  name: true,
  code: true,
  scope: true,
  description: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.PermissionSelect;

export const permissionCodes = {
  viewMitraPermissions: 'mitra.view.permissions',
  manageMitraPermissions: 'mitra.manage.permissions',
  viewInsidiaPermissions: 'insidia.view.permissions',
  manageInsidiaPermissions: 'insidia.manage.permissions',
};
