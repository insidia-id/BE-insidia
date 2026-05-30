import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../infrastruktur/prisma/prisma.service';

export const courseListSelect = {
  id: true,
  creatorId: true,
  mitraId: true,
  curriculumId: true,
  title: true,
  slug: true,
  code: true,
  subtitle: true,
  description: true,
  status: true,
  academicStatus: true,
  level: true,
  categoryId: true,
  language: true,
  price: true,
  salePrice: true,
  isFree: true,
  requirements: true,
  outcomes: true,
  targetUsers: true,
  totalDurationSec: true,
  totalLessons: true,
  publishedAt: true,
  rejectedAt: true,
  rejectReason: true,
  scope: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
  creator: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
  category: {
    select: {
      id: true,
      name: true,
      slug: true,
    },
  },
  curriculum: {
    select: {
      id: true,
      name: true,
      code: true,
      status: true,
    },
  },
  _count: {
    select: {
      modules: true,
      media: true,
      lessons: true,
    },
  },
} satisfies Prisma.CourseSelect;

export const courseDetailSelect = {
  ...courseListSelect,
  modules: {
    orderBy: {
      sortOrder: 'asc',
    },
    select: {
      id: true,
      title: true,
      summary: true,
      sortOrder: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          lessons: true,
          media: true,
        },
      },
    },
  },
} satisfies Prisma.CourseSelect;

export const courseAccessSelect = {
  id: true,
  creatorId: true,
  mitraId: true,
  curriculumId: true,
  title: true,
  code: true,
  slug: true,
  status: true,
  academicStatus: true,
  deletedAt: true,
  price: true,
  salePrice: true,
  isFree: true,
  publishedAt: true,
  rejectedAt: true,
  rejectReason: true,
  scope: true,
} satisfies Prisma.CourseSelect;

@Injectable()
export class CourseRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.CourseCreateInput) {
    return this.prisma.course.create({
      data,
      select: courseDetailSelect,
    });
  }

  findAll(params?: {
    creatorId?: string;
    scope?: Prisma.CourseWhereInput['scope'];
    status?: Prisma.CourseWhereInput['status'];
    mitraId?: string;
  }) {
    const { creatorId, scope, status, mitraId } = params ?? {};

    return this.prisma.course.findMany({
      where: {
        creatorId,
        scope,
        status,
        mitraId,
        deletedAt: null,
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: courseListSelect,
    });
  }

  findActiveById(id: string) {
    return this.prisma.course.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      select: courseDetailSelect,
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

  update(id: string, data: Prisma.CourseUpdateInput) {
    return this.prisma.course.update({
      where: { id },
      data,
      select: courseDetailSelect,
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
        status: 'ARCHIVED',
      },
    });

    return result.count > 0;
  }
}
