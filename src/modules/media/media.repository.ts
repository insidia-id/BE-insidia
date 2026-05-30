import { Injectable } from '@nestjs/common';
import { MediaOwnerType, Prisma } from '@prisma/client';
import { PrismaService } from '../../infrastruktur/prisma/prisma.service';
import { mediaSelect } from './media.constants';

@Injectable()
export class MediaRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.MediaUncheckedCreateInput) {
    return this.prisma.$transaction(async (tx) => {
      if (data.isPrimary) {
        await this.clearPrimaryByOwner(tx, data);
      }

      return tx.media.create({
        data,
        select: mediaSelect,
      });
    });
  }

  findCourseMedia(courseId: string) {
    return this.prisma.media.findMany({
      where: {
        courseId,
        ownerType: MediaOwnerType.COURSE,
        course: {
          deletedAt: null,
        },
      },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
      select: mediaSelect,
    });
  }

  findModuleMedia(moduleId: string) {
    return this.prisma.media.findMany({
      where: {
        moduleId,
        ownerType: MediaOwnerType.MODULE,
        module: {
          course: {
            deletedAt: null,
          },
        },
      },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
      select: mediaSelect,
    });
  }

  findById(id: string) {
    return this.prisma.media.findFirst({
      where: {
        id,
        OR: [
          {
            ownerType: MediaOwnerType.COURSE,
            course: {
              is: {
                deletedAt: null,
              },
            },
          },
          {
            ownerType: MediaOwnerType.MODULE,
            module: {
              is: {
                course: {
                  deletedAt: null,
                },
              },
            },
          },
        ],
      },
      select: mediaSelect,
    });
  }

  update(id: string, data: Prisma.MediaUpdateInput) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.media.findUnique({
        where: { id },
        select: {
          id: true,
          ownerType: true,
          courseId: true,
          moduleId: true,
        },
      });

      if (!existing) {
        throw new Error('MEDIA_NOT_FOUND');
      }

      if (data.isPrimary === true) {
        await this.clearPrimaryByOwner(tx, existing);
      }

      return tx.media.update({
        where: { id },
        data,
        select: mediaSelect,
      });
    });
  }

  async remove(id: string) {
    const result = await this.prisma.media.deleteMany({
      where: {
        id,
      },
    });

    return result.count > 0;
  }

  private clearPrimaryByOwner(
    tx: Prisma.TransactionClient,
    media: {
      ownerType: MediaOwnerType;
      courseId?: string | null;
      moduleId?: string | null;
    },
  ) {
    if (media.ownerType === MediaOwnerType.COURSE && media.courseId) {
      return tx.media.updateMany({
        where: {
          ownerType: MediaOwnerType.COURSE,
          courseId: media.courseId,
          isPrimary: true,
        },
        data: {
          isPrimary: false,
        },
      });
    }

    if (media.ownerType === MediaOwnerType.MODULE && media.moduleId) {
      return tx.media.updateMany({
        where: {
          ownerType: MediaOwnerType.MODULE,
          moduleId: media.moduleId,
          isPrimary: true,
        },
        data: {
          isPrimary: false,
        },
      });
    }

    return Promise.resolve();
  }
}
