import type { Prisma } from '@prisma/client';

export const MyAcademicPermissionCodes = {
  myClassGroup: {
    view: 'myclassgroup.view.mitra',
  },
  myClassCourse: {
    view: 'myclasscourse.view.mitra',
  },
};

export const findMyClassGroupsSelect = {
  id: true,
  mitraId: true,
  classGroupId: true,
  teacherId: true,
  academicYearId: true,
  semesterId: true,
  status: true,
  createdAt: true,
  classGroup: {
    select: {
      id: true,
      name: true,
    },
  },
} satisfies Prisma.ClassGroupCourseSelect;

export const findMyClassStudentsSelect = {
  id: true,
  mitraId: true,
  classGroupId: true,
  studentId: true,
  academicYearId: true,
  semesterId: true,
  status: true,
  createdAt: true,
  classGroup: {
    select: {
      id: true,
      name: true,
    },
  },
} satisfies Prisma.ClassGroupStudentSelect;

export const findMyCoursesTeacherSelect = {
  id: true,
  title: true,
  subtitle: true,
  mitra: {
    select: {
      mitraId: true,
      curriculumId: true,
      classGroupCourses: {
        select: {
          teacherId: true,
          academicYearId: true,
          semesterId: true,
        },
      },
    },
  },
} satisfies Prisma.CourseSelect;

export const findMyCoursesStudentSelect = {
  id: true,
  title: true,
  subtitle: true,
  mitra: {
    select: {
      mitraId: true,
      curriculumId: true,
      classGroupCourses: {
        select: {
          teacherId: true,
          teacher: {
            select: {
              id: true,
              name: true,
            },
          },
          academicYearId: true,
          semesterId: true,
          mitra: {
            select: {
              classGroupStudents: {
                select: {
                  studentId: true,
                },
              },
            },
          },
        },
      },
    },
  },
} satisfies Prisma.CourseSelect;
