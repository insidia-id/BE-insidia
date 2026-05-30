import { z } from 'zod';
import { normalizeRoleCode } from '../../access-control/access-control.utils';

export const createMitraMemberSchema = z.object({
  userId: z.string().trim().min(1, 'userId wajib diisi'),
  roleCode: z
    .string()
    .trim()
    .min(1, 'roleCode wajib diisi')
    .transform(normalizeRoleCode),
});

export type CreateMitraMemberDto = z.infer<typeof createMitraMemberSchema>;
