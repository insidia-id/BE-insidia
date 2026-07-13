import { z } from 'zod';
import { normalizeRoleCode } from '../../modules/access-control/access-control.utils';

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),

  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export type PaginationQuery = z.infer<typeof paginationQuerySchema>;

export const optionalNullableDateSchema = z.preprocess((value) => {
  if (value === '' || value == null) return null;

  const date = new Date(value as string | number | Date);

  return isNaN(date.getTime()) ? null : date;
}, z.date().nullable().optional());

export const optionalNullableStringSchema = z.preprocess(
  (value) => (value === '' ? null : value),
  z.string().trim().min(1).nullable().optional(),
);

export const roleCodeSchema = z
  .string()
  .trim()
  .min(1)
  .transform(normalizeRoleCode);

export const optionalStringSchema = z.preprocess(
  (value) => (value === '' ? undefined : value),
  z.string().trim().min(1).optional(),
);

export const optionalBooleanSchema = z.preprocess((value) => {
  if (typeof value === 'string') {
    return value === 'true';
  }

  return value;
}, z.boolean().optional());

export const optionalNullableNumberSchema = z.preprocess((value) => {
  if (value === '' || value === null || value === undefined) {
    return null;
  }

  return value;
}, z.coerce.number().min(0).nullable().optional());

export const stringArraySchema = z
  .array(z.string().trim().min(1))
  .default([])
  .transform((items) => items.map((item) => item.trim()));

export const dateSchema = z.coerce.date({
  error: 'tanggal tidak valid',
});
