import { z } from 'zod';
import { academicStatusSchema } from '../../mitra-academic/shared/academic-shared.dto';
import { dateSchema } from '../../../shared/zod/zod.schemas';

export const baseAcademicYearSchema = z.object({
  name: z.string().trim().min(1, 'nama tahun ajaran wajib diisi'),
  startDate: dateSchema,
  endDate: dateSchema,
  status: academicStatusSchema.optional().default('ACTIVE'),
});

export const createAcademicYearSchema = baseAcademicYearSchema.refine(
  (value) => value.endDate > value.startDate,
  {
    message: 'tanggal selesai harus lebih besar dari tanggal mulai',
    path: ['endDate'],
  },
);

export const updateAcademicYearSchema = baseAcademicYearSchema
  .partial()
  .superRefine((value, ctx) => {
    if (value.startDate && value.endDate && value.endDate <= value.startDate) {
      ctx.addIssue({
        code: 'custom',
        message: 'tanggal selesai harus lebih besar dari tanggal mulai',
        path: ['endDate'],
      });
    }
  });

export type CreateAcademicYearDto = z.infer<typeof createAcademicYearSchema>;
export type UpdateAcademicYearDto = z.infer<typeof updateAcademicYearSchema>;
