import { z } from 'zod';
import { normalizeRoleCode } from '../../modules/access-control/access-control.utils';
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
