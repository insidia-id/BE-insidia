import { z } from 'zod';
import { LearningItemType } from '@prisma/client';

export const BaseLearningItemSchema = z.object({
  type: z.nativeEnum(LearningItemType, {
    message: 'Tipe learning item tidak valid',
  }),
  title: z.string().trim().min(1, 'Judul learning item wajib diisi'),
  slug: z.string().trim().min(1, 'Slug learning item wajib diisi'),
  order: z.coerce.number().int().min(0, 'Urutan harus bilangan positif'),
  description: z.string().trim().optional().nullable(),
  published: z.boolean().optional().default(false),
  availableFrom: z.coerce.date().optional().nullable(),
  availableUntil: z.coerce.date().optional().nullable(),
  isPreview: z.boolean().optional().default(false),
});

export const createLearningItemSchema = BaseLearningItemSchema;

export type CreateLearningItemDto = z.infer<typeof createLearningItemSchema>;
