import { Prisma } from '@prisma/client';
export const mitraSelect = {
  id: true,
  name: true,
  slug: true,
  type: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
} satisfies Prisma.MitraSelect;

export const mitraProfileSelect = {
  id: true,
  mitraId: true,
  npsn: true,
  address: true,
} satisfies Prisma.MitraProfileSelect;

export const mitraMemberSelect = {
  id: true,
  userId: true,
  mitraId: true,
  roleId: true,
  createdAt: true,
  updatedAt: true,
  user: {
    select: {
      id: true,
      name: true,
      email: true,
      status: true,
    },
  },
  role: {
    select: {
      id: true,
      code: true,
      name: true,
      scope: true,
    },
  },
} satisfies Prisma.UserMitraRoleSelect;

export const mitraPermissionCode = {
  create: 'mitra.create',
  view: 'mitra.view',
  update: 'mitra.update',
  delete: 'mitra.delete',
};
