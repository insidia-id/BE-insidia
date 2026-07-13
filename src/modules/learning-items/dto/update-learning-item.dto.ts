import { z } from 'zod';
import { LearningItemType } from '@prisma/client';
import { BaseLearningItemSchema } from './create-learning-item.dto';

export const updateLearningItemSchema = BaseLearningItemSchema.partial();

export type UpdateLearningItemDto = z.infer<typeof updateLearningItemSchema>;
