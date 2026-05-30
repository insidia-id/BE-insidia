import { z } from 'zod';

const optionalNullableStringSchema = z.preprocess(
  (value) => (value === '' ? null : value),
  z.string().trim().min(1).nullable().optional(),
);

export const createCourseModuleSchema = z.object({
  title: z.string().trim().min(1, 'judul module wajib diisi'),
  summary: optionalNullableStringSchema,
  sortOrder: z.coerce.number().int().min(0).optional().default(0),
});

export type CreateCourseModuleDto = z.infer<typeof createCourseModuleSchema>;
