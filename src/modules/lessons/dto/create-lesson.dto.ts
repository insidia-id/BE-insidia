import { z } from 'zod';
import { LessonType } from '@prisma/client';
import { createLearningItemSchema } from '../../learning-items/dto/create-learning-item.dto';

export const createLessonSchema = createLearningItemSchema.extend({
  typeLesson: z.enum(LessonType, {
    message: 'Tipe lesson tidak valid',
  }),
  contentJson: z.any().optional().nullable(),
  contentHtml: z.string().optional().nullable(),
});

export type CreateLessonDto = z.infer<typeof createLessonSchema>;
