import { z } from 'zod';
import { normalizeRoleCode } from '../access-control.utils';

export const nullableTrimmedStringSchema = z.preprocess(
  (value) => (value === '' ? null : value),
  z.string().trim().min(1).nullable().optional(),
);

export const roleCodeSchema = z
  .string()
  .trim()
  .min(1)
  .transform(normalizeRoleCode);
