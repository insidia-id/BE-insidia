import { Injectable } from '@nestjs/common';
import { Prisma, RoleScope } from '@prisma/client';
import { PrismaService } from '../../infrastruktur/prisma/prisma.service';

export const courseModuleSelect = {
  id: true,
  title: true,
  summary: true,
  sortOrder: true,
  courseInsidiaId: true,
  classGroupCourseId: true,
  createdAt: true,
  updatedAt: true,
  courseInsidia: {
    select: {
      id: true,
      course: {
        select: {
          id: true,
          creatorId: true,
          title: true,
          scope: true,
        },
      },
    },
  },
  classGroupCourse: {
    select: {
      id: true,
      teacherId: true,
      courseMitra: {
        select: {
          course: {
            select: {
              id: true,
              title: true,
              scope: true,
            },
          },
        },
      },
    },
  },
  _count: {
    select: {
      media: true,
      learningItems: true,
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

  findByCourseInsidiaId(courseInsidiaId: string) {
    return this.prisma.module.findMany({
      where: {
        courseInsidiaId,
        courseInsidia: {
          course: {
            deletedAt: null,
          },
        },
      },
      orderBy: {
        sortOrder: 'asc',
      },
      select: courseModuleSelect,
    });
  }

  findByClassGroupCourseId(classGroupCourseId: string) {
    return this.prisma.module.findMany({
      where: {
        classGroupCourseId,
        classGroupCourse: {
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
        OR: [
          {
            courseInsidia: {
              course: {
                deletedAt: null,
              },
            },
          },
          {
            classGroupCourse: {
              deletedAt: null,
            },
          },
        ],
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
        OR: [
          {
            courseInsidia: {
              course: {
                deletedAt: null,
              },
            },
          },
          {
            classGroupCourse: {
              deletedAt: null,
            },
          },
        ],
      },
    });

    return result.count > 0;
  }

  // Helper to check if module belongs to INSIDIA domain
  async isInsidiaModule(moduleId: string): Promise<boolean> {
    const module = await this.prisma.module.findUnique({
      where: { id: moduleId },
      select: { courseInsidiaId: true },
    });
    return module?.courseInsidiaId !== null;
  }

  // Helper to check if module belongs to MITRA domain
  async isMitraModule(moduleId: string): Promise<boolean> {
    const module = await this.prisma.module.findUnique({
      where: { id: moduleId },
      select: { classGroupCourseId: true },
    });
    return module?.classGroupCourseId !== null;
  }
}
