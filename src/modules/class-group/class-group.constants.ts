import { Prisma } from '@prisma/client';

export const classGroupPermissionCodes = {
  classGroup: {
    create: 'classgroup.create.mitra',
    view: 'classgroup.view.mitra',
    update: 'classgroup.update.mitra',
    remove: 'classgroup.remove.mitra',
  },
};

export const classGroupListSelect = {
  id: true,
  mitraId: true,
  classId: true,
  name: true,
  waliKelasId: true,
  status: true,
  createdAt: true,
  deletedAt: true,
  academicClass: {
    select: {
      id: true,
      name: true,
    },
  },
  waliKelas: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
} satisfies Prisma.ClassGroupSelect;

export const classGroupDetailSelect = {
  ...classGroupListSelect,
  academicClass: {
    select: {
      id: true,
      name: true,
      academicYearId: true,
      semesterId: true,
      curriculumId: true,
    },
  },
  updatedAt: true,
} satisfies Prisma.ClassGroupSelect;
