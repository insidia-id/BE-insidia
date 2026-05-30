import { MediaType } from '@prisma/client';
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

export const uploadMediaSchema = z.object({
  type: z.enum(MediaType).optional(),
  alt: optionalNullableStringSchema,
  caption: optionalNullableStringSchema,
  sortOrder: z.coerce.number().int().min(0).optional().default(0),
  isPrimary: optionalBooleanSchema.default(false),
});

export type UploadMediaDto = z.infer<typeof uploadMediaSchema>;
