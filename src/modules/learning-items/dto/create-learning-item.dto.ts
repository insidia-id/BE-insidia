import { z } from 'zod';
import { LearningItemType } from '@prisma/client';

export const createLearningItemSchema = z.object({
  type: z.nativeEnum(LearningItemType, {
    message: 'Tipe learning item tidak valid',
  }),
  title: z.string().trim().min(1, 'Judul learning item wajib diisi'),
  order: z.coerce.number().int().min(0, 'Urutan harus bilangan positif'),
  published: z.boolean().optional().default(false),
  availableFrom: z.coerce.date().optional().nullable(),
  availableUntil: z.coerce.date().optional().nullable(),
});

export type CreateLearningItemDto = z.infer<typeof createLearningItemSchema>;
