import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../infrastruktur/prisma/prisma.service';
import { RoleScope } from '@prisma/client';
import {
  courseAccessSelect,
  courseInsidiaDetailSelect,
  courseInsidiaListSelect,
  courseMitraDetailSelect,
  courseMitraListSelect,
  selectCourseDetailByScope,
  selectCourseListByScope,
} from './course.constants';

@Injectable()
export class CourseRepository {
  constructor(private readonly prisma: PrismaService) {}

  create<T extends Prisma.CourseSelect>(
    data: Prisma.CourseCreateInput,
    select: T,
  ) {
    return this.prisma.course.create({
      data,
      select,
    });
  }

  findAll<T extends Prisma.CourseSelect>(
    params: {
      creatorId?: string;
      scope: RoleScope;
      mitraId?: string | null;
    },
    select: T,
  ) {
    const { creatorId, scope, mitraId } = params ?? {};

    return this.prisma.course.findMany({
      where: {
        creatorId,
        scope,
        ...(mitraId !== undefined
          ? {
              mitra: {
                mitraId,
              },
            }
          : {}),
        deletedAt: null,
      },
      orderBy: {
        createdAt: 'desc',
      },
      select,
    });
  }
  coursePermission(id: string) {
    return this.prisma.course.findUnique({
      where: { id },
      select: {
        creatorId: true,
      },
    });
  }
  findActiveById<T extends Prisma.CourseSelect>(
    id: string,
    select: T,
  ): Promise<Prisma.CourseGetPayload<{ select: T }> | null> {
    return this.prisma.course.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      select,
    });
  }

  findAccessById(id: string) {
    return this.prisma.course.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      select: courseAccessSelect,
    });
  }

  update<T extends Prisma.CourseSelect>(
    id: string,
    data: Prisma.CourseUpdateInput,
    select: T,
  ) {
    return this.prisma.course.update({
      where: { id },
      data,
      select,
    });
  }

  async softDelete(id: string) {
    const result = await this.prisma.course.updateMany({
      where: {
        id,
        deletedAt: null,
      },
      data: {
        deletedAt: new Date(),
      },
    });

    return result.count > 0;
  }
  async findSubjectSlugsByPrefix(
    prefix: string,
    ignoredId?: string,
  ): Promise<string[]> {
    const subjects = await this.prisma.course.findMany({
      where: {
        slug: {
          startsWith: prefix,
        },
        ...(ignoredId && {
          NOT: {
            id: ignoredId,
          },
        }),
      },
      select: {
        slug: true,
      },
    });

    return subjects.map((subject) => subject.slug);
  }
}
