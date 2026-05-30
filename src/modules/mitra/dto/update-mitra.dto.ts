import { AcademicStatus, MitraType } from '@prisma/client';
import { z } from 'zod';
import { normalizeMitraSlug } from './create-mitra.dto';

export const updateMitraSchema = z.object({
  name: z.string().trim().min(1).optional(),
  slug: z.string().trim().min(1).transform(normalizeMitraSlug).optional(),
  type: z.enum(MitraType).optional(),
  status: z.enum(AcademicStatus).optional(),
});

export type UpdateMitraDto = z.infer<typeof updateMitraSchema>;
