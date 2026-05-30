import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../infrastruktur/prisma/prisma.service';

export const courseModuleSelect = {
  id: true,
  courseId: true,
  title: true,
  summary: true,
  sortOrder: true,
  createdAt: true,
  updatedAt: true,
  course: {
    select: {
      id: true,
      creatorId: true,
      title: true,
      deletedAt: true,
    },
  },
  _count: {
    select: {
      lessons: true,
      media: true,
    },
  },
} satisfies Prisma.ModuleSelect;

@Injectable()
export class CourseModulesRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.ModuleUncheckedCreateInput) {
    return this.prisma.module.create({
      data,
      select: courseModuleSelect,
    });
  }

  findByCourseId(courseId: string) {
    return this.prisma.module.findMany({
      where: {
        courseId,
        course: {
          deletedAt: null,
        },
      },
      orderBy: {
        sortOrder: 'asc',
      },
      select: courseModuleSelect,
    });
  }

  findById(id: string) {
    return this.prisma.module.findFirst({
      where: {
        id,
        course: {
          deletedAt: null,
        },
      },
      select: courseModuleSelect,
    });
  }

  update(id: string, data: Prisma.ModuleUpdateInput) {
    return this.prisma.module.update({
      where: { id },
      data,
      select: courseModuleSelect,
    });
  }

  async remove(id: string) {
    const result = await this.prisma.module.deleteMany({
      where: {
        id,
        course: {
          deletedAt: null,
        },
      },
    });

    return result.count > 0;
  }
}
