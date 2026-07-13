import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../infrastruktur/prisma/prisma.service';
import {
  learningItemSelect,
  learningDetailItemSelect,
} from './learning-items.constants';
import type { CreateLearningItemDto } from './dto/create-learning-item.dto';
@Injectable()
export class LearningItemsRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(
    tx: Prisma.TransactionClient,
    dto: CreateLearningItemDto,
    moduleId: string,
  ) {
    return tx.learningItem.create({
      data: {
        ...dto,
        moduleId,
      },
    });
  }

  findByModuleId(
    moduleId: string,
    options?: {
      studentView?: boolean;
    },
  ) {
    return this.prisma.learningItem.findMany({
      where: {
        moduleId,
        lesson: {
          deletedAt: null,
        },
        ...(options?.studentView && {
          published: true,
        }),
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
      select: learningDetailItemSelect,
    });
  }

  update(
    tx: Prisma.TransactionClient,
    id: string,
    data: Prisma.LearningItemUpdateInput,
  ) {
    return tx.learningItem.update({
      where: { id },
      data,
    });
  }
}
