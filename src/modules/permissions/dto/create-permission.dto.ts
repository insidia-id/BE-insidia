import { z } from 'zod';
import { nullableTrimmedStringSchema } from '../../access-control/dto/shared-access.dto';

export const createPermissionSchema = z.object({
  name: z.string().trim().min(1, 'nama permission wajib diisi'),
  scope: z.enum(['PLATFORM', 'MITRA'], 'ruang lingkup permission tidak valid'),
  description: nullableTrimmedStringSchema,
});
export function normalizePermissionCode(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '.');
}
export type CreatePermissionDto = z.infer<typeof createPermissionSchema>;
