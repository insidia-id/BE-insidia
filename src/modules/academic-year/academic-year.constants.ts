import { Prisma } from '@prisma/client';
export const academicYearPermissionCodes = {
  academicYear: {
    create: 'academicyear.create.mitra',
    view: 'academicyear.view.mitra',
    update: 'academicyear.update.mitra',
    remove: 'academicyear.remove.mitra',
  },
};

export const academicYearListSelect = {
  id: true,
  mitraId: true,
  name: true,
  startDate: true,
  endDate: true,
  status: true,
  createdAt: true,
  deletedAt: true,
} satisfies Prisma.AcademicYearSelect;

export const academicYearDetailSelect = {
  ...academicYearListSelect,
  updatedAt: true,
} satisfies Prisma.AcademicYearSelect;
