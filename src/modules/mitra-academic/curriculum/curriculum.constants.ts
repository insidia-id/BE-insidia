import { Prisma } from '@prisma/client';

export const curriculumSelect = {
  id: true,
  mitraId: true,
  name: true,
  code: true,
  description: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
} satisfies Prisma.CurriculumSelect;
