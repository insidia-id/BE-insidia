import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastruktur/prisma/prisma.service';
import { lessonSelect } from './lessons.constants';
import { LearningItemsRepository } from '../learning-items/learning-items.repository';
import { MapCreateLessonData, MapUpdateLessonData } from './lessons.mapper';

@Injectable()
export class LessonsRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly learningItemsRepository: LearningItemsRepository,
  ) {}

  async create(moduleId: string, data: MapCreateLessonData) {
    return this.prisma.$transaction(async (tx) => {
      const learningItem = await this.learningItemsRepository.create(
        tx,
        data.learningItem,
        moduleId,
      );

      return tx.lesson.create({
        data: {
          learningItemId: learningItem.id,
          ...data.lesson,
        },
        select: lessonSelect,
      });
    });
  }

  async update(id: string, data: MapUpdateLessonData) {
    return this.prisma.$transaction(async (tx) => {
      await this.learningItemsRepository.update(tx, id, data.learningItem);

      return tx.lesson.update({
        where: { learningItemId: id },
        data: data.lesson,
        select: lessonSelect,
      });
    });
  }

  findByLearningItemId(learningItemId: string) {
    return this.prisma.lesson.findUnique({
      where: {
        learningItemId,
        deletedAt: null,
      },
      select: lessonSelect,
    });
  }

  findById(id: string) {
    return this.prisma.lesson.findFirst({
      where: {
        id,
        deletedAt: null,
        OR: [
          {
            learningItem: {
              module: {
                courseInsidia: {
                  course: {
                    deletedAt: null,
                  },
                },
              },
            },
          },
          {
            learningItem: {
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
          },
        ],
      },
      select: lessonSelect,
    });
  }

  async softDelete(id: string) {
    const result = await this.prisma.lesson.updateMany({
      where: {
        id,
        deletedAt: null,
        OR: [
          {
            learningItem: {
              module: {
                courseInsidia: {
                  course: {
                    deletedAt: null,
                  },
                },
              },
            },
          },
          {
            learningItem: {
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
          },
        ],
      },
      data: {
        deletedAt: new Date(),
      },
    });

    return result.count > 0;
  }
}
