import { Prisma } from '@prisma/client';

export const classGroupCoursePermissionCodes = {
  classGroupCourse: {
    create: 'classgroupcourse.create.mitra',
    view: 'classgroupcourse.view.mitra',
    update: 'classgroupcourse.update.mitra',
    remove: 'classgroupcourse.remove.mitra',
  },
};

export const classGroupCourseListSelect = {
  id: true,
  mitraId: true,
  classGroupId: true,
  courseMitraId: true,
  teacherId: true,
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
  courseMitra: {
    select: {
      id: true,
      course: {
        select: {
          id: true,
          title: true,
        },
      },
    },
  },
  teacher: {
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
} satisfies Prisma.ClassGroupCourseSelect;

export const classGroupCourseDetailSelect = {
  ...classGroupCourseListSelect,
  updatedAt: true,
} satisfies Prisma.ClassGroupCourseSelect;
