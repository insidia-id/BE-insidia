import { Prisma } from '@prisma/client';
export const mediaSelect = {
  id: true,
  type: true,
  ownerType: true,
  url: true,
  publicId: true,
  filename: true,
  mimeType: true,
  sizeBytes: true,
  durationSec: true,
  alt: true,
  caption: true,
  sortOrder: true,
  isPrimary: true,
  courseId: true,
  moduleId: true,
  lessonId: true,
  reviewId: true,
  commentId: true,
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
  module: {
    select: {
      id: true,
      title: true,
      course: {
        select: {
          id: true,
          creatorId: true,
          title: true,
          deletedAt: true,
        },
      },
    },
  },
} satisfies Prisma.MediaSelect;
export const mediaPermissionCodes = {
  create: 'media.create.insidia.all',
  view: 'media.view.insidia.all',
  update: 'media.update.insidia.all',
  remove: 'media.remove.insidia.all',

  createMitra: 'media.create.mitra.all',
  viewMitra: 'media.view.mitra.all',
  updateMitra: 'media.update.mitra.all',
  removeMitra: 'media.remove.mitra.all',
} as const;
