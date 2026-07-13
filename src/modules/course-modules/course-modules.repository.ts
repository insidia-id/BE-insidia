import { Injectable } from '@nestjs/common';
import { Prisma, RoleScope } from '@prisma/client';
import { PrismaService } from '../../infrastruktur/prisma/prisma.service';
import {
  courseModuleMitraSelect,
  courseModuleInsidiaSelect,
  courseModuleSelect,
} from './course-modules.constants';
@Injectable()
export class CourseModulesRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.ModuleUncheckedCreateInput) {
    return this.prisma.module.create({
      data,
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
      select: courseModuleInsidiaSelect,
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
      select: courseModuleMitraSelect,
    });
  }

  findModuleMitraByid(id: string) {
    return this.prisma.module.findFirst({
      where: {
        id,
      },
      select: courseModuleMitraSelect,
    });
  }

  findModuleInsidiaByid(id: string) {
    return this.prisma.module.findFirst({
      where: {
        id,
      },
      select: courseModuleInsidiaSelect,
    });
  }
  update(id: string, data: Prisma.ModuleUpdateInput) {
    return this.prisma.module.update({
      where: { id },
      data,
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
              courseMitra: {
                course: {
                  deletedAt: null,
                },
              },
            },
          },
        ],
      },
      select: {
        id: true,
        courseInsidia: {
          select: {
            course: {
              select: {
                creatorId: true,
              },
            },
          },
        },
        classGroupCourse: {
          select: {
            teacherId: true,
          },
        },
      },
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

  async isInsidiaModule(moduleId: string): Promise<boolean> {
    const module = await this.prisma.module.findUnique({
      where: { id: moduleId },
      select: { courseInsidiaId: true },
    });
    return module?.courseInsidiaId !== null;
  }

  async isMitraModule(moduleId: string): Promise<boolean> {
    const module = await this.prisma.module.findUnique({
      where: { id: moduleId },
      select: { classGroupCourseId: true },
    });
    return module?.classGroupCourseId !== null;
  }
  ensureMuridRegisteredForModule(moduleId: string, muridId: string) {
    return this.prisma.module.findFirstOrThrow({
      where: {
        id: moduleId,
        OR: [
          {
            classGroupCourse: {
              deletedAt: null,
              classGroup: {
                classGroupStudents: {
                  some: {
                    studentId: muridId,
                    deletedAt: null,
                  },
                },
              },
            },
          },
        ],
      },
      select: {
        classGroupCourse: {
          select: {
            classGroup: {
              select: {
                classGroupStudents: {
                  where: {
                    studentId: muridId,
                    deletedAt: null,
                  },
                  select: {
                    studentId: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }
  ensureTeacherAssignedForModule(moduleId: string, teacherId: string) {
    return this.prisma.module.findFirstOrThrow({
      where: {
        id: moduleId,
        classGroupCourse: {
          deletedAt: null,
          teacherId,
        },
      },
      select: {
        classGroupCourse: {
          select: {
            teacherId: true,
          },
        },
      },
    });
  }
}
