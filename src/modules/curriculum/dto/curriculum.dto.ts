import { z } from 'zod';
import { academicStatusSchema } from '../../mitra-academic/shared/academic-shared.dto';
import { optionalNullableStringSchema } from '../../../shared/zod/zod.schemas';

export const baseCurriculumSchema = z.object({
  name: z.string().trim().min(1, 'nama kurikulum wajib diisi'),
  code: optionalNullableStringSchema,
  description: optionalNullableStringSchema,
  status: academicStatusSchema.optional().default('ACTIVE'),
});
export const createCurriculumSchema = baseCurriculumSchema;

export const updateCurriculumSchema = baseCurriculumSchema.partial();

export type CreateCurriculumDto = z.infer<typeof createCurriculumSchema>;
export type UpdateCurriculumDto = z.infer<typeof updateCurriculumSchema>;
