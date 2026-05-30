import { z } from 'zod';
import {
  academicStatusSchema,
  dateSchema,
  idSchema,
} from '../shared/academic-shared.dto';

export const createSemesterSchema = z
  .object({
    academicYearId: idSchema,
    name: z.string().trim().min(1, 'nama semester wajib diisi'),
    startDate: dateSchema,
    endDate: dateSchema,
    status: academicStatusSchema.optional().default('ACTIVE'),
  })
  .refine((value) => value.endDate > value.startDate, {
    message: 'tanggal selesai harus lebih besar dari tanggal mulai',
    path: ['endDate'],
  });

export const updateSemesterSchema = z
  .object({
    academicYearId: idSchema.optional(),
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

export type CreateSemesterDto = z.infer<typeof createSemesterSchema>;
export type UpdateSemesterDto = z.infer<typeof updateSemesterSchema>;
