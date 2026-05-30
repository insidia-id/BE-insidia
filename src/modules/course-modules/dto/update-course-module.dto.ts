import { z } from 'zod';

const optionalNullableStringSchema = z.preprocess(
  (value) => (value === '' ? null : value),
  z.string().trim().min(1).nullable().optional(),
);

export const updateCourseModuleSchema = z.object({
  title: z.string().trim().min(1).optional(),
  summary: optionalNullableStringSchema,
  sortOrder: z.coerce.number().int().min(0).optional(),
});

export type UpdateCourseModuleDto = z.infer<typeof updateCourseModuleSchema>;
