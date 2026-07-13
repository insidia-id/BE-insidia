import { Prisma } from '@prisma/client';
export const lessonSelect = {
  id: true,
  learningItemId: true,
  type: true,
  contentJson: true,
  contentHtml: true,
} satisfies Prisma.LessonSelect;

export type LessonSelect = Prisma.LessonGetPayload<{
  select: typeof lessonSelect;
}>;
