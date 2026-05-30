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
  email: z.string().trim().email(),
  name: optionalNullableStringSchema,
  phone: optionalNullableStringSchema,
  role: roleCodeSchema.optional().default('USER'),
  mitraRole: roleCodeSchema.optional(),
  scope: z.enum(RoleScope, 'ruang lingkup permission tidak valid'),
  status: z.enum(userStatusValues).optional().default('ACTIVE'),
  mitraId: z.string().trim().min(1).optional(),
}).superRefine((value, ctx) => {
  if (value.scope !== 'MITRA') {
    return;
  }

  if (!value.mitraId) {
    ctx.addIssue({
      code: 'custom',
      message: 'mitraId wajib diisi untuk user scope MITRA',
      path: ['mitraId'],
    });
  }

  if (!value.mitraRole) {
    ctx.addIssue({
      code: 'custom',
      message: 'mitraRole wajib diisi untuk user scope MITRA',
      path: ['mitraRole'],
    });
  }
});

export type CreateUserDto = z.infer<typeof createUserSchema>;
