import { z } from 'zod';
import {
  academicStatusSchema,
  idSchema,
} from '../../mitra-academic/shared/academic-shared.dto';

export const classGroupCourseListQuerySchema = z.object({
  classGroupId: idSchema.optional(),
  courseId: idSchema.optional(),
  teacherId: idSchema.optional(),
  academicYearId: idSchema.optional(),
  semesterId: idSchema.optional(),
});
export const baseClassGroupCourseSchema = z.object({
  classGroupId: idSchema,
  courseMitraId: idSchema,
  teacherId: idSchema,
  academicYearId: idSchema,
  semesterId: idSchema,
  status: academicStatusSchema.optional().default('ACTIVE'),
});

export const createClassGroupCourseSchema = baseClassGroupCourseSchema;

export const updateClassGroupCourseSchema =
  baseClassGroupCourseSchema.partial();

export type CreateClassGroupCourseDto = z.infer<
  typeof createClassGroupCourseSchema
>;
export type ClassGroupCourseListQueryDto = z.infer<
  typeof classGroupCourseListQuerySchema
>;
export type UpdateClassGroupCourseDto = z.infer<
  typeof updateClassGroupCourseSchema
>;
