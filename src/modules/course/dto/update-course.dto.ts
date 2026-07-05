import { z } from 'zod';
import {
  createCourseInsidiaSchema,
  createCourseMitraSchema,
} from './create-course.dto';

export const updateCourseSchema = z.discriminatedUnion('scope', [
  createCourseInsidiaSchema,
  createCourseMitraSchema,
]);
export type UpdateCourseInsidiaDto = z.infer<typeof createCourseInsidiaSchema>;
export type UpdateCourseMitraDto = z.infer<typeof createCourseMitraSchema>;
export type UpdateCourseDto = z.infer<typeof updateCourseSchema>;
