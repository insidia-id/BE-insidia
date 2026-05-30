import { z } from 'zod';
import {
  academicStatusSchema,
  dateSchema,
} from '../shared/academic-shared.dto';

export const createAcademicYearSchema = z
  .object({
    name: z.string().trim().min(1, 'nama tahun ajaran wajib diisi'),
    startDate: dateSchema,
    endDate: dateSchema,
    status: academicStatusSchema.optional().default('ACTIVE'),
  })
  .refine((value) => value.endDate > value.startDate, {
    message: 'tanggal selesai harus lebih besar dari tanggal mulai',
    path: ['endDate'],
  });

export const updateAcademicYearSchema = z
  .object({
    name: z.string().trim().min(1).optional(),
    startDate: dateSchema.optional(),
    endDate: dateSchema.optional(),
    status: academicStatusSchema.optional(),
  })
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
