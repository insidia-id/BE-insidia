import { z } from 'zod';
import { LearningItemType } from '@prisma/client';

export const updateLearningItemSchema = z.object({
  type: z
    .nativeEnum(LearningItemType, {
      message: 'Tipe learning item tidak valid',
    })
    .optional(),
  title: z.string().trim().min(1, 'Judul learning item wajib diisi').optional(),
  order: z.coerce
    .number()
    .int()
    .min(0, 'Urutan harus bilangan positif')
    .optional(),
  published: z.boolean().optional(),
  availableFrom: z.coerce.date().nullable().optional(),
  availableUntil: z.coerce.date().nullable().optional(),
});

export type UpdateLearningItemDto = z.infer<typeof updateLearningItemSchema>;
