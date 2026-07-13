import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastruktur/prisma/prisma.service';
import { AcademicStatus } from '@prisma/client';
import { RoleScope } from '@prisma/client';
import {
  findMyClassGroupsSelect,
  findMyClassStudentsSelect,
  findMyCoursesTeacherSelect,
  findMyCoursesStudentSelect,
} from './my-academic.constants';
@Injectable()
export class MyAcademicRepository {
  constructor(private readonly prisma: PrismaService) {}
  findTeacherClassGroups(params: {
    mitraId: string;
    teacherId: string;
    academicYearId?: string;
    semesterId?: string;
  }) {
    const { academicYearId, mitraId, semesterId, ...rest } = params;

    return this.prisma.classGroupCourse.findMany({
      where: {
        ...rest,
        mitraId,
        deletedAt: null,
        status: AcademicStatus.ACTIVE,
        ...(academicYearId ? { academicYearId } : {}),
        ...(semesterId ? { semesterId } : {}),
      },
      orderBy: [{ classGroup: { name: 'asc' } }],
      select: findMyClassGroupsSelect,
    });
  }

  findStudentClassGroups(params: {
    mitraId: string;
    studentId: string;
    academicYearId?: string;
    semesterId?: string;
  }) {
    const { academicYearId, mitraId, semesterId, ...rest } = params;

    return this.prisma.classGroupStudent.findMany({
      where: {
        ...rest,
        mitraId,
        deletedAt: null,
        status: AcademicStatus.ACTIVE,
        ...(academicYearId ? { academicYearId } : {}),
        ...(semesterId ? { semesterId } : {}),
      },
      orderBy: [{ classGroup: { name: 'asc' } }],
      select: findMyClassStudentsSelect,
    });
  }

  findTeacherCourses(params: {
    mitraId: string;
    teacherId: string;
    academicYearId?: string;
    semesterId?: string;
  }) {
    const { academicYearId, mitraId, semesterId, ...rest } = params;

    return this.prisma.course.findMany({
      where: {
        scope: RoleScope.MITRA,
        mitra: {
          mitraId: mitraId,
          classGroupCourses: {
            some: {
              teacherId: rest.teacherId,
              deletedAt: null,
              status: AcademicStatus.ACTIVE,
              ...(academicYearId ? { academicYearId } : {}),
              ...(semesterId ? { semesterId } : {}),
            },
          },
        },
      },
      orderBy: {
        title: 'asc',
      },
      select: findMyCoursesTeacherSelect(rest.teacherId),
    });
  }

  findTeacherCourseById(params: {
    mitraId: string;
    teacherId: string;
    id: string;
  }) {
    const { mitraId, id, ...rest } = params;

    return this.prisma.course.findFirst({
      where: {
        id: id,
        scope: RoleScope.MITRA,
        mitra: {
          mitraId: mitraId,
          classGroupCourses: {
            some: {
              teacherId: rest.teacherId,
              deletedAt: null,
              status: AcademicStatus.ACTIVE,
            },
          },
        },
      },
      select: findMyCoursesTeacherSelect(rest.teacherId),
    });
  }

  findStudentCourses(params: {
    mitraId: string;
    studentId: string;
    academicYearId?: string;
    semesterId?: string;
  }) {
    const { academicYearId, mitraId, semesterId, ...rest } = params;

    return this.prisma.course.findMany({
      where: {
        scope: RoleScope.MITRA,
        deletedAt: null,
        mitra: {
          mitraId: mitraId,
          classGroupCourses: {
            some: {
              deletedAt: null,
              status: AcademicStatus.ACTIVE,
              ...(academicYearId ? { academicYearId } : {}),
              ...(semesterId ? { semesterId } : {}),
              classGroup: {
                classGroupStudents: {
                  some: {
                    studentId: rest.studentId,
                    deletedAt: null,
                    status: AcademicStatus.ACTIVE,
                    ...(academicYearId ? { academicYearId } : {}),
                    ...(semesterId ? { semesterId } : {}),
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        title: 'asc',
      },
      select: findMyCoursesStudentSelect(
        rest.studentId,
        academicYearId,
        semesterId,
      ),
    });
  }
  findStudentCourseById(params: {
    mitraId: string;
    studentId: string;
    id: string;
  }) {
    const { mitraId, id, ...rest } = params;

    return this.prisma.course.findFirst({
      where: {
        id: id,
        scope: RoleScope.MITRA,
        deletedAt: null,
        mitra: {
          mitraId: mitraId,
          classGroupCourses: {
            some: {
              deletedAt: null,
              status: AcademicStatus.ACTIVE,
              classGroup: {
                classGroupStudents: {
                  some: {
                    studentId: rest.studentId,
                    deletedAt: null,
                    status: AcademicStatus.ACTIVE,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        title: 'asc',
      },
      select: findMyCoursesStudentSelect(rest.studentId),
    });
  }
}
