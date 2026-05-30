import { z } from 'zod';
import { academicStatusSchema, idSchema } from '../shared/academic-shared.dto';

export const createAcademicClassSchema = z.object({
  academicYearId: idSchema,
  semesterId: idSchema,
  curriculumId: idSchema,
  name: z.string().trim().min(1, 'nama kelas wajib diisi'),
  level: z.string().trim().min(1, 'tingkat wajib diisi'),
  status: academicStatusSchema.optional().default('ACTIVE'),
});

export const updateAcademicClassSchema = z.object({
  academicYearId: idSchema.optional(),
  semesterId: idSchema.optional(),
  curriculumId: idSchema.optional(),
  name: z.string().trim().min(1).optional(),
  level: z.string().trim().min(1).optional(),
  status: academicStatusSchema.optional(),
});

export type CreateAcademicClassDto = z.infer<typeof createAcademicClassSchema>;
export type UpdateAcademicClassDto = z.infer<typeof updateAcademicClassSchema>;
