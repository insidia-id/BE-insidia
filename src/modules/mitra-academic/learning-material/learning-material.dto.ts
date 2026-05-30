import { z } from 'zod';
import {
  academicStatusSchema,
  idSchema,
  optionalNullableStringSchema,
} from '../shared/academic-shared.dto';

export const createLearningMaterialSchema = z.object({
  classGroupId: idSchema,
  courseId: idSchema,
  title: z.string().trim().min(1, 'judul materi wajib diisi'),
  description: optionalNullableStringSchema,
});

export const updateLearningMaterialSchema = z.object({
  title: z.string().trim().min(1).optional(),
  description: optionalNullableStringSchema,
  status: academicStatusSchema.optional(),
});

export const learningMaterialListQuerySchema = z.object({
  academicYearId: idSchema.optional(),
  semesterId: idSchema.optional(),
  classGroupId: idSchema.optional(),
  courseId: idSchema.optional(),
  teacherId: idSchema.optional(),
});

export type CreateLearningMaterialDto = z.infer<
  typeof createLearningMaterialSchema
>;
export type UpdateLearningMaterialDto = z.infer<
  typeof updateLearningMaterialSchema
>;
export type LearningMaterialListQueryDto = z.infer<
  typeof learningMaterialListQuerySchema
>;
