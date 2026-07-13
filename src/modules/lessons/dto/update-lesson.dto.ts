import { z } from 'zod';
import { LessonType } from '@prisma/client';
import { createLessonSchema } from './create-lesson.dto';

export const updateLessonSchema = createLessonSchema.partial();

export type UpdateLessonDto = z.infer<typeof updateLessonSchema>;
