import { Prisma } from '@prisma/client';

export const classGroupStudentPermissionCodes = {
  classGroupStudent: {
    create: 'classgroupstudent.create.mitra',
    view: 'classgroupstudent.view.mitra',
    update: 'classgroupstudent.update.mitra',
    remove: 'classgroupstudent.remove.mitra',
  },
};

export const classGroupStudentListSelect = {
  id: true,
  mitraId: true,
  classGroupId: true,
  studentId: true,
  academicYearId: true,
  semesterId: true,
  status: true,
  createdAt: true,
  deletedAt: true,
  classGroup: {
    select: {
      id: true,
      name: true,
    },
  },
  student: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
  academicYear: {
    select: {
      id: true,
      name: true,
    },
  },
  semester: {
    select: {
      id: true,
      name: true,
    },
  },
} satisfies Prisma.ClassGroupStudentSelect;

export const classGroupStudentDetailSelect = {
  ...classGroupStudentListSelect,
  updatedAt: true,
} satisfies Prisma.ClassGroupStudentSelect;
