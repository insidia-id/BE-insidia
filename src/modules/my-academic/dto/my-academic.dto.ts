import { z } from 'zod';
import { idSchema } from '../../mitra-academic/shared/academic-shared.dto';
export const MyAcademicQuery = z.object({
  academicYearId: idSchema.optional(),
  semesterId: idSchema.optional(),
  classGroupId: idSchema.optional(),
  courseId: idSchema.optional(),
  teacherId: idSchema.optional(),
});

export type MyAcademicQueryDto = z.infer<typeof MyAcademicQuery>;
