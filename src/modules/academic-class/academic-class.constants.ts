import { Prisma } from '@prisma/client';

export const academicClassPermissionCodes = {
  academicClass: {
    create: 'academicclass.create.mitra',
    view: 'academicclass.view.mitra',
    update: 'academicclass.update.mitra',
    remove: 'academicclass.remove.mitra',
  },
};

export const academicClassListSelect = {
  id: true,
  mitraId: true,
  academicYearId: true,
  semesterId: true,
  curriculumId: true,
  name: true,
  level: true,
  status: true,
  createdAt: true,
  deletedAt: true,
  semester: {
    select: {
      id: true,
      name: true,
    },
  },
  curriculum: {
    select: {
      id: true,
      name: true,
    },
  },
} satisfies Prisma.AcademicClassSelect;

export const academicClassDetailSelect = {
  ...academicClassListSelect,
  updatedAt: true,
} satisfies Prisma.AcademicClassSelect;
