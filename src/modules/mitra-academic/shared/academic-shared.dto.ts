import { AcademicStatus } from '@prisma/client';
import { z } from 'zod';

export const idSchema = z.string().trim().min(1);

export const academicStatusSchema = z.enum(
  AcademicStatus,
  'status akademik tidak valid',
);
