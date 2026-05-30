import { z } from 'zod';
import { academicStatusSchema, idSchema } from '../shared/academic-shared.dto';

export const classGroupCourseListQuerySchema = z.object({
  classGroupId: idSchema.optional(),
  courseId: idSchema.optional(),
  teacherId: idSchema.optional(),
  academicYearId: idSchema.optional(),
  semesterId: idSchema.optional(),
});

export const createClassGroupCourseSchema = z.object({
  classGroupId: idSchema,
  courseId: idSchema,
  teacherId: idSchema,
  academicYearId: idSchema,
  semesterId: idSchema,
  status: academicStatusSchema.optional().default('ACTIVE'),
});

export const updateClassGroupCourseSchema = z.object({
  classGroupId: idSchema.optional(),
  courseId: idSchema.optional(),
  teacherId: idSchema.optional(),
  academicYearId: idSchema.optional(),
  semesterId: idSchema.optional(),
  status: academicStatusSchema.optional(),
});

export type CreateClassGroupCourseDto = z.infer<
  typeof createClassGroupCourseSchema
>;
export type ClassGroupCourseListQueryDto = z.infer<
  typeof classGroupCourseListQuerySchema
>;
export type UpdateClassGroupCourseDto = z.infer<
  typeof updateClassGroupCourseSchema
>;
