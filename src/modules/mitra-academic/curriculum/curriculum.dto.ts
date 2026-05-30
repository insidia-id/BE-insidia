import { z } from 'zod';
import {
  academicStatusSchema,
  optionalNullableStringSchema,
} from '../shared/academic-shared.dto';

export const createCurriculumSchema = z.object({
  name: z.string().trim().min(1, 'nama kurikulum wajib diisi'),
  code: optionalNullableStringSchema,
  description: optionalNullableStringSchema,
  status: academicStatusSchema.optional().default('ACTIVE'),
});

export const updateCurriculumSchema = z.object({
  name: z.string().trim().min(1).optional(),
  code: optionalNullableStringSchema,
  description: optionalNullableStringSchema,
  status: academicStatusSchema.optional(),
});

export type CreateCurriculumDto = z.infer<typeof createCurriculumSchema>;
export type UpdateCurriculumDto = z.infer<typeof updateCurriculumSchema>;
