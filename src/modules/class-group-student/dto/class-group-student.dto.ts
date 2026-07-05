import { z } from 'zod';
import {
  academicStatusSchema,
  idSchema,
} from '../../mitra-academic/shared/academic-shared.dto';

export const classGroupStudentListQuerySchema = z.object({
  classGroupId: idSchema.optional(),
  studentId: idSchema.optional(),
  academicYearId: idSchema.optional(),
  semesterId: idSchema.optional(),
});

export const baseClassGroupStudentSchema = z.object({
  classGroupId: idSchema,
  studentId: idSchema,
  academicYearId: idSchema,
  semesterId: idSchema,
  status: academicStatusSchema.optional().default('ACTIVE'),
});

export const createClassGroupStudentSchema = baseClassGroupStudentSchema;

export const updateClassGroupStudentSchema =
  baseClassGroupStudentSchema.partial();

export type CreateClassGroupStudentDto = z.infer<
  typeof createClassGroupStudentSchema
>;
export type ClassGroupStudentListQueryDto = z.infer<
  typeof classGroupStudentListQuerySchema
>;
export type UpdateClassGroupStudentDto = z.infer<
  typeof updateClassGroupStudentSchema
>;
