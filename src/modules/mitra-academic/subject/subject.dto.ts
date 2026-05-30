import { z } from 'zod';
import {
  academicStatusSchema,
  idSchema,
  optionalNullableStringSchema,
} from '../shared/academic-shared.dto';

export const createSubjectSchema = z.object({
  curriculumId: idSchema,
  name: z.string().trim().min(1, 'nama mata pelajaran wajib diisi'),
  code: z.string().trim().min(1, 'kode mata pelajaran wajib diisi'),
  description: optionalNullableStringSchema,
  status: academicStatusSchema.optional().default('ACTIVE'),
});

export const updateSubjectSchema = z.object({
  curriculumId: idSchema.optional(),
  name: z.string().trim().min(1).optional(),
  code: z.string().trim().min(1).optional(),
  description: optionalNullableStringSchema,
  status: academicStatusSchema.optional(),
});

export type CreateSubjectDto = z.infer<typeof createSubjectSchema>;
export type UpdateSubjectDto = z.infer<typeof updateSubjectSchema>;
