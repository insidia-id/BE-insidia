import { Prisma } from '@prisma/client';

export const semesterPermissionCodes = {
  semester: {
    create: 'semester.create.mitra',
    view: 'semester.view.mitra',
    update: 'semester.update.mitra',
    remove: 'semester.remove.mitra',
  },
};

export const semesterListSelect = {
  id: true,
  mitraId: true,
  academicYearId: true,
  name: true,
  startDate: true,
  endDate: true,
  status: true,
  createdAt: true,
  deletedAt: true,
  academicYear: {
    select: {
      id: true,
      name: true,
    },
  },
} satisfies Prisma.SemesterSelect;

export const semesterDetailSelect = {
  ...semesterListSelect,
  updatedAt: true,
} satisfies Prisma.SemesterSelect;
