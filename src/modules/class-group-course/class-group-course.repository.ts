import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastruktur/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { classGroupCourseDetailSelect } from './class-group-course.constants';
@Injectable()
export class ClassGroupCourseRepository {
  constructor(private readonly prisma: PrismaService) {}

  createClassGroupCourse(data: Prisma.ClassGroupCourseCreateInput) {
    return this.prisma.classGroupCourse.create({
      data,
    });
  }

  updateClassGroupCourse(id: string, data: Prisma.ClassGroupCourseUpdateInput) {
    return this.prisma.classGroupCourse.update({
      where: { id },
      data,
      select: classGroupCourseDetailSelect,
    });
  }

  findClassGroupCourses(params: {
    mitraId: string;
    classGroupId?: string;
    courseId?: string;
    teacherId?: string;
    academicYearId?: string;
    semesterId?: string;
  }) {
    return this.prisma.classGroupCourse.findMany({
      where: {
        mitraId: params.mitraId,
        ...(params.classGroupId ? { classGroupId: params.classGroupId } : {}),
        ...(params.courseId ? { courseId: params.courseId } : {}),
        ...(params.teacherId ? { teacherId: params.teacherId } : {}),
        ...(params.academicYearId
          ? { academicYearId: params.academicYearId }
          : {}),
        ...(params.semesterId ? { semesterId: params.semesterId } : {}),
        deletedAt: null,
      },
      orderBy: [{ classGroup: { name: 'asc' } }, { course: { title: 'asc' } }],
      select: classGroupCourseDetailSelect,
    });
  }

  findClassGroupCourseById(id: string) {
    return this.prisma.classGroupCourse.findUnique({
      where: { id },
      select: classGroupCourseDetailSelect,
    });
  }
}
