import { z } from 'zod';
import {
  academicStatusSchema,
  idSchema,
} from '../../mitra-academic/shared/academic-shared.dto';
import { dateSchema } from 'src/shared/zod/zod.schemas';

const semesterBaseSchema = z.object({
  academicYearId: idSchema,
  name: z.string().trim().min(1, 'nama semester wajib diisi'),
  startDate: dateSchema,
  endDate: dateSchema,
  status: academicStatusSchema.optional().default('ACTIVE'),
});

export const createSemesterSchema = semesterBaseSchema.refine(
  (value) => value.endDate > value.startDate,
  {
    message: 'tanggal selesai harus lebih besar dari tanggal mulai',
    path: ['endDate'],
  },
);

export const updateSemesterSchema = semesterBaseSchema
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

export type CreateSemesterDto = z.infer<typeof createSemesterSchema>;
export type UpdateSemesterDto = z.infer<typeof updateSemesterSchema>;
