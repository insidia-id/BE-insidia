import { AcademicStatus } from '@prisma/client';
import { z } from 'zod';

export const idSchema = z.string().trim().min(1);

export const academicStatusSchema = z.enum(
  AcademicStatus,
  'status akademik tidak valid',
);

export const optionalNullableStringSchema = z.preprocess(
  (value) => (value === '' ? null : value),
  z.string().trim().min(1).nullable().optional(),
);

export const dateSchema = z.coerce.date({
  error: 'tanggal tidak valid',
});

export const optionalBooleanSchema = z.preprocess((value) => {
  if (typeof value === 'string') {
    return value === 'true';
  }

  return value;
}, z.boolean().optional());

export const optionalNumberSchema = z.preprocess((value) => {
  if (value === '' || value === undefined || value === null) {
    return undefined;
  }

  return value;
}, z.coerce.number().optional());

export function normalizeSlugPart(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .replace(/[_\s]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}
