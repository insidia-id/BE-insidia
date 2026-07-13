import { AcademicStatus, type Prisma } from '@prisma/client';
import { RoleScope } from 'src/shared/enums/enums';

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
  updatedAt: true,
  teacher: {
    select: {
      id: true,
      name: true,
      email: true,
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
  classGroup: {
    select: {
      id: true,
      name: true,
      academicClass: {
        select: {
          id: true,
          name: true,
        },
      },
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

export const findMyClassStudentsSelect = {
  id: true,
  mitraId: true,
  classGroupId: true,
  studentId: true,
  academicYearId: true,
  semesterId: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  classGroup: {
    select: {
      id: true,
      name: true,
      academicClass: {
        select: {
          id: true,
          name: true,
        },
      },
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

export const findMyCoursesTeacherSelect = (teacherId: string) =>
  ({
    id: true,
    title: true,
    subtitle: true,
    description: true,
    slug: true,
    scope: true,
    createdAt: true,
    updatedAt: true,
    mitra: {
      select: {
        mitraId: true,
        curriculumId: true,
        mitra: {
          select: {
            name: true,
          },
        },
        classGroupCourses: {
          where: {
            teacherId,
            deletedAt: null,
          },
          select: {
            id: true,
            teacher: {
              select: {
                id: true,
                name: true,
              },
            },
            classGroup: {
              select: {
                id: true,
                name: true,
              },
            },
            _count: {
              select: {
                modules: true,
              },
            },
            modules: {
              select: {
                _count: {
                  select: {
                    learningItems: true,
                  },
                },
              },
            },
            academicYearId: true,
            semesterId: true,
          },
        },
        curriculum: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    },
  }) satisfies Prisma.CourseSelect;

export const findMyCoursesStudentSelect = (
  studentId: string,
  academicYearId?: string,
  semesterId?: string,
) =>
  ({
    id: true,
    title: true,
    subtitle: true,
    slug: true,
    description: true,
    scope: true,
    updatedAt: true,
    createdAt: true,
    mitra: {
      select: {
        mitraId: true,
        curriculumId: true,
        mitra: {
          select: {
            name: true,
          },
        },
        classGroupCourses: {
          where: {
            deletedAt: null,
            status: AcademicStatus.ACTIVE,
            ...(academicYearId ? { academicYearId } : {}),
            ...(semesterId ? { semesterId } : {}),
            classGroup: {
              classGroupStudents: {
                some: {
                  studentId,
                  deletedAt: null,
                  status: AcademicStatus.ACTIVE,
                  ...(academicYearId ? { academicYearId } : {}),
                  ...(semesterId ? { semesterId } : {}),
                },
              },
            },
          },
          select: {
            id: true,
            _count: {
              select: {
                modules: true,
              },
            },
            modules: {
              select: {
                _count: {
                  select: {
                    learningItems: true,
                  },
                },
              },
            },
            teacherId: true,
            teacher: {
              select: {
                id: true,
                name: true,
              },
            },
            academicYearId: true,
            semesterId: true,
          },
        },
        curriculum: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    },
  }) satisfies Prisma.CourseSelect;
