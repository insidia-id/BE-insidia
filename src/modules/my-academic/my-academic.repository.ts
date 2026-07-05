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
    const { academicYearId, semesterId, ...rest } = params;

    return this.prisma.classGroupCourse.findMany({
      where: {
        ...rest,
        deletedAt: null,
        status: AcademicStatus.ACTIVE,
        ...(academicYearId ? { academicYearId } : {}),
        ...(semesterId ? { semesterId } : {}),
      },
      orderBy: [{ classGroup: { name: 'asc' } }, { course: { title: 'asc' } }],
      select: findMyClassGroupsSelect,
    });
  }

  findStudentClassGroups(params: {
    mitraId: string;
    studentId: string;
    academicYearId?: string;
    semesterId?: string;
  }) {
    const { academicYearId, semesterId, ...rest } = params;

    return this.prisma.classGroupStudent.findMany({
      where: {
        ...rest,
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
    const { academicYearId, semesterId, ...rest } = params;

    return this.prisma.course.findMany({
      where: {
        mitraId: rest.mitraId,
        scope: RoleScope.MITRA,
        deletedAt: null,
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
      orderBy: {
        title: 'asc',
      },
      select: findMyCoursesTeacherSelect,
    });
  }

  findStudentCourses(params: {
    mitraId: string;
    studentId: string;
    academicYearId?: string;
    semesterId?: string;
  }) {
    const { academicYearId, semesterId, ...rest } = params;

    return this.prisma.course.findMany({
      where: {
        mitraId: rest.mitraId,
        scope: RoleScope.MITRA,
        deletedAt: null,
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
      orderBy: {
        title: 'asc',
      },
      select: findMyCoursesStudentSelect,
    });
  }
}
