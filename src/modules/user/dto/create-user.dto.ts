import { z } from 'zod';
import { RoleScope } from '@prisma/client';
import {
  InsidiaRole,
  MitraRole,
  Gender,
  Religion,
  userStatusValues,
} from '../../../shared/enums/enums';
import {
  optionalNullableDateSchema,
  optionalNullableStringSchema,
} from '../../../shared/zod/zod.schemas';

export const roleProfileSchema = z.object({
  nip: optionalNullableStringSchema,
  subject: optionalNullableStringSchema,
  bio: optionalNullableStringSchema,
  nis: optionalNullableStringSchema,
  kelas: optionalNullableStringSchema,
  jurusan: optionalNullableStringSchema,
  waliId: optionalNullableStringSchema,
  pekerjaan: optionalNullableStringSchema,
  alamat: optionalNullableStringSchema,
  position: optionalNullableStringSchema,
  division: optionalNullableStringSchema,
  note: optionalNullableStringSchema,
});

export const mitraRoleItemSchema = z.object({
  mitraId: z.string().trim().min(1, 'mitra wajib dipilih'),
  roleCode: z.enum(MitraRole, {
    message: 'role mitra tidak valid',
  }),
  profile: roleProfileSchema.optional(),
});
export const baseUserSchema = z.object({
  email: z.string().trim().email(),
  name: optionalNullableStringSchema,
  phone: optionalNullableStringSchema,
  nik: optionalNullableStringSchema,
  birthPlace: optionalNullableStringSchema,
  birthDate: optionalNullableDateSchema,
  gender: z
    .enum(Gender, {
      message: 'jenis kelamin tidak valid',
    })
    .optional(),
  religion: z
    .enum(Religion, {
      message: 'agama tidak valid',
    })
    .optional(),
  role: z
    .enum(InsidiaRole, {
      message: 'role insidia tidak valid',
    })
    .optional(),
  mitraRoles: z
    .array(mitraRoleItemSchema, {
      message: 'mitraRoles harus berupa array',
    })
    .optional(),

  scope: z.enum(RoleScope, {
    message: 'ruang lingkup permission tidak valid',
  }),
  status: z
    .enum(userStatusValues, {
      message: 'status user tidak valid harus salah satu dari: ACTIVE, BANNED',
    })
    .optional()
    .default('ACTIVE'),
});

export const createUserSchema = baseUserSchema.superRefine((value, ctx) => {
  if (value.scope !== 'MITRA') {
    return;
  }

  if (!value.mitraRoles || value.mitraRoles.length === 0) {
    ctx.addIssue({
      code: 'custom',
      message: 'mitraRoles wajib diisi untuk user scope MITRA',
      path: ['mitraRoles'],
    });
  }
});
export type MitraRoleItemInput = z.infer<typeof mitraRoleItemSchema>;
export type MitraRoleProfileInput = z.infer<typeof roleProfileSchema>;
export type CreateUserDto = z.infer<typeof createUserSchema>;
