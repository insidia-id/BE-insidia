import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../infrastruktur/prisma/prisma.service';

export const learningItemSelect = {
  id: true,
  moduleId: true,
  type: true,
  title: true,
  order: true,
  published: true,
  availableFrom: true,
  availableUntil: true,
  createdAt: true,
  updatedAt: true,
  module: {
    select: {
      id: true,
      title: true,
      summary: true,
      sortOrder: true,
      courseInsidiaId: true,
      classGroupCourseId: true,
      courseInsidia: {
        select: {
          id: true,
          course: {
            select: {
              id: true,
              creatorId: true,
              title: true,
              scope: true,
              deletedAt: true,
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
                  deletedAt: true,
                },
              },
            },
          },
        },
      },
    },
  },
  lesson: {
    select: {
      id: true,
      title: true,
      type: true,
      isPublished: true,
    },
  },
  quiz: {
    select: {
      id: true,
      duration: true,
      passingScore: true,
      maxAttempts: true,
    },
  },
  assignment: {
    select: {
      id: true,
      instruction: true,
      dueDate: true,
      maxScore: true,
    },
  },
} satisfies Prisma.LearningItemSelect;

type LearningItemRecord = Prisma.LearningItemGetPayload<{
  select: typeof learningItemSelect;
}>;

@Injectable()
export class LearningItemsRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.LearningItemUncheckedCreateInput) {
    return this.prisma.learningItem.create({
      data,
      select: learningItemSelect,
    });
  }

  findByModuleId(moduleId: string) {
    return this.prisma.learningItem.findMany({
      where: {
        moduleId,
        // Filter by active modules (non-deleted parent entities)
        OR: [
          {
            module: {
              courseInsidia: {
                course: {
                  deletedAt: null,
                },
              },
            },
          },
          {
            module: {
              classGroupCourse: {
                deletedAt: null,
                courseMitra: {
                  course: {
                    deletedAt: null,
                  },
                },
              },
            },
          },
        ],
      },
      orderBy: {
        order: 'asc',
      },
      select: learningItemSelect,
    });
  }

  findById(id: string) {
    return this.prisma.learningItem.findFirst({
      where: {
        id,
        // Filter by active modules (non-deleted parent entities)
        OR: [
          {
            module: {
              courseInsidia: {
                course: {
                  deletedAt: null,
                },
              },
            },
          },
          {
            module: {
              classGroupCourse: {
                deletedAt: null,
                courseMitra: {
                  course: {
                    deletedAt: null,
                  },
                },
              },
            },
          },
        ],
      },
      select: learningItemSelect,
    });
  }

  update(id: string, data: Prisma.LearningItemUpdateInput) {
    return this.prisma.learningItem.update({
      where: { id },
      data,
      select: learningItemSelect,
    });
  }

  async remove(id: string) {
    const result = await this.prisma.learningItem.deleteMany({
      where: {
        id,
        // Only allow deletion from active modules
        OR: [
          {
            module: {
              courseInsidia: {
                course: {
                  deletedAt: null,
                },
              },
            },
          },
          {
            module: {
              classGroupCourse: {
                deletedAt: null,
                courseMitra: {
                  course: {
                    deletedAt: null,
                  },
                },
              },
            },
          },
        ],
      },
    });

    return result.count > 0;
  }
}
