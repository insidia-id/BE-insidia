import { z } from 'zod';
import {
  academicStatusSchema,
  idSchema,
} from '../../mitra-academic/shared/academic-shared.dto';

export const baseClassGroupSchema = z.object({
  classId: idSchema,
  name: z.string().trim().min(1, 'nama rombel wajib diisi'),
  waliKelasId: idSchema.nullable().optional(),
  status: academicStatusSchema.optional().default('ACTIVE'),
});

export const createClassGroupSchema = baseClassGroupSchema;

export const updateClassGroupSchema = baseClassGroupSchema.partial();

export type CreateClassGroupDto = z.infer<typeof createClassGroupSchema>;
export type UpdateClassGroupDto = z.infer<typeof updateClassGroupSchema>;
