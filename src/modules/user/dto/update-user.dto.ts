import { z } from 'zod';
import {
  optionalNullableStringSchema,
  roleCodeSchema,
} from './create-user.dto';

const userStatusValues = ['ACTIVE', 'SUSPENDED', 'BANNED'] as const;

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

export const updateUserSchema = z.object({
  email: z.string().trim().email().optional(),
  name: optionalNullableStringSchema,
  phone: optionalNullableStringSchema,
  role: roleCodeSchema.optional(),
  status: z.enum(userStatusValues).optional(),
  bio: optionalNullableStringSchema,
  scope: z.enum(['PLATFORM', 'MITRA'], 'ruang lingkup permission tidak valid'),
  websiteUrl: optionalNullableStringSchema,
  socialLinks: socialLinksValueSchema.optional(),
});

export type UpdateUserDto = z.infer<typeof updateUserSchema>;
