import { Prisma } from '@prisma/client';

export const curriculumListSelect = {
  id: true,
  mitraId: true,
  name: true,
  code: true,
  description: true,
  status: true,
  createdAt: true,
  deletedAt: true,
} satisfies Prisma.CurriculumSelect;

export const curriculumDetailSelect = {
  ...curriculumListSelect,
  updatedAt: true,
} satisfies Prisma.CurriculumSelect;

export const curriculumPermissionCodes = {
  curriculum: {
    create: 'curriculum.create.mitra',
    view: 'curriculum.view.mitra',
    update: 'curriculum.update.mitra',
    remove: 'curriculum.remove.mitra',
  },
};
