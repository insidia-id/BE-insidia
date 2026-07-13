import { Prisma } from '@prisma/client';

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
  lesson: {
    select: {
      id: true,
    },
  },
  quiz: {
    select: {
      id: true,
    },
  },
  assignment: {
    select: {
      id: true,
    },
  },
} satisfies Prisma.LearningItemSelect;

export const learningDetailItemSelect = {
  id: true,
  moduleId: true,
  type: true,
  title: true,
  order: true,
  published: true,
  availableFrom: true,
  availableUntil: true,
  isPreview: true,
  createdAt: true,
  updatedAt: true,
  module: {
    select: {
      classGroupCourse: {
        select: {
          id: true,
          teacherId: true,
        },
      },
      courseInsidia: {
        select: {
          id: true,
          course: {
            select: {
              id: true,
              creatorId: true,
            },
          },
        },
      },
    },
  },
  lesson: {
    select: {
      id: true,
    },
  },
  quiz: {
    select: {
      id: true,
    },
  },
  assignment: {
    select: {
      id: true,
    },
  },
} satisfies Prisma.LearningItemSelect;

export const learningItemDetailMitraSelect = {
  ...learningDetailItemSelect,
  module: {
    select: {
      id: true,
      classGroupCourse: {
        select: {
          id: true,
          teacherId: true,
        },
      },
    },
  },
} satisfies Prisma.LearningItemSelect;

export const learningItemDetailInsidiaSelect = {
  ...learningDetailItemSelect,
  module: {
    select: {
      id: true,
      courseInsidia: {
        select: {
          id: true,
          course: {
            select: {
              id: true,
              creatorId: true,
            },
          },
        },
      },
    },
  },
} satisfies Prisma.LearningItemSelect;

export type LearningDetailItemRecord = Prisma.LearningItemGetPayload<{
  select: typeof learningDetailItemSelect;
}>;
export type LearningItemRecord = Prisma.LearningItemGetPayload<{
  select: typeof learningItemSelect;
}>;
