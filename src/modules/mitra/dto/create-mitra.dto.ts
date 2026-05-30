import { AcademicStatus, MitraType } from '@prisma/client';
import { z } from 'zod';

export function normalizeMitraSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .replace(/[_\s]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export const createMitraSchema = z.object({
  name: z.string().trim().min(1, 'nama mitra wajib diisi'),
  type: z.enum(MitraType, 'tipe mitra tidak valid'),
  status: z.enum(AcademicStatus, 'status mitra tidak valid'),
});

export type CreateMitraDto = z.infer<typeof createMitraSchema>;
