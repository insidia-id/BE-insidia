import { z } from 'zod';
import { baseUserSchema } from './create-user.dto';
import { optionalNullableStringSchema } from '../../../shared/zod/zod.schemas';
const socialLinksValueSchema = z
  .object({
    instagram: optionalNullableStringSchema,
    linkedin: optionalNullableStringSchema,
    github: optionalNullableStringSchema,
  })
  .nullable()
  .transform((value) => {
    if (value === null) return null;

    const hasValue = Object.values(value).some(Boolean);
    return hasValue ? value : null;
  });

export const updateUserSchema = baseUserSchema.extend({
  bio: optionalNullableStringSchema,
  websiteUrl: optionalNullableStringSchema,
  socialLinks: socialLinksValueSchema.optional(),
});

export type UpdateUserDto = z.infer<typeof updateUserSchema>;
