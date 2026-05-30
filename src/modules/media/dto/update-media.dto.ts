import { z } from 'zod';

const optionalNullableStringSchema = z.preprocess(
  (value) => (value === '' ? null : value),
  z.string().trim().min(1).nullable().optional(),
);

const optionalBooleanSchema = z.preprocess((value) => {
  if (typeof value === 'string') {
    return value === 'true';
  }

  return value;
}, z.boolean().optional());

export const updateMediaSchema = z.object({
  alt: optionalNullableStringSchema,
  caption: optionalNullableStringSchema,
  sortOrder: z.coerce.number().int().min(0).optional(),
  isPrimary: optionalBooleanSchema,
});

export type UpdateMediaDto = z.infer<typeof updateMediaSchema>;
