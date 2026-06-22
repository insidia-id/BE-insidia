import { z } from 'zod';
import { optionalNullableStringSchema } from '../../../shared/zod/zod.schemas';

export const createMuridProfileSchema = z.object({
  nis: optionalNullableStringSchema,
  kelas: optionalNullableStringSchema,
  jurusan: optionalNullableStringSchema,
  waliId: optionalNullableStringSchema,
});

export const createGuruProfileSchema = z.object({
  nip: optionalNullableStringSchema,
});

export type CreateMuridProfileDto = z.infer<typeof createMuridProfileSchema>;
export type CreateGuruProfileDto = z.infer<typeof createGuruProfileSchema>;
