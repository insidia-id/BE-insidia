import { z } from 'zod';
import { normalizeRoleCode } from '../../access-control/access-control.utils';
import { RoleScope } from '@prisma/client';

const userStatusValues = ['ACTIVE', 'BANNED'] as const;

export const optionalNullableStringSchema = z.preprocess(
  (value) => (value === '' ? null : value),
  z.string().trim().min(1).nullable().optional(),
);

export const roleCodeSchema = z
  .string()
  .trim()
  .min(1)
  .transform(normalizeRoleCode);

export const createUserSchema = z.object({
  email: z.email(),
  name: optionalNullableStringSchema,
  phone: optionalNullableStringSchema,
  role: roleCodeSchema.optional().default('USER'),
  mitraRole: roleCodeSchema.optional(),
  scope: z.enum(RoleScope, 'ruang lingkup permission tidak valid'),
  status: z.enum(userStatusValues).optional().default('ACTIVE'),
  mitraId: z.string().trim().min(1).optional(),
});

export type CreateUserDto = z.infer<typeof createUserSchema>;
