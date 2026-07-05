import { z } from 'zod';
import {
  academicStatusSchema,
  idSchema,
} from '../../mitra-academic/shared/academic-shared.dto';

export const baseAcademicClassSchema = z.object({
  academicYearId: idSchema,
  semesterId: idSchema,
  curriculumId: idSchema,
  name: z.string().trim().min(1, 'nama kelas wajib diisi'),
  level: z.string().trim().min(1, 'tingkat wajib diisi'),
  status: academicStatusSchema.optional().default('ACTIVE'),
});

export const createAcademicClassSchema = baseAcademicClassSchema;
export const updateAcademicClassSchema = baseAcademicClassSchema.partial();

export type CreateAcademicClassDto = z.infer<typeof createAcademicClassSchema>;
export type UpdateAcademicClassDto = z.infer<typeof updateAcademicClassSchema>;
