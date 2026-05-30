import { z } from 'zod';
import { academicStatusSchema, idSchema } from '../shared/academic-shared.dto';

export const createClassGroupSchema = z.object({
  classId: idSchema,
  name: z.string().trim().min(1, 'nama rombel wajib diisi'),
  waliKelasId: idSchema.nullable().optional(),
  status: academicStatusSchema.optional().default('ACTIVE'),
});

export const updateClassGroupSchema = z.object({
  classId: idSchema.optional(),
  name: z.string().trim().min(1).optional(),
  waliKelasId: idSchema.nullable().optional(),
  status: academicStatusSchema.optional(),
});

export type CreateClassGroupDto = z.infer<typeof createClassGroupSchema>;
export type UpdateClassGroupDto = z.infer<typeof updateClassGroupSchema>;
