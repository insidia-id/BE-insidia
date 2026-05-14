import { z } from 'zod';
import {
  nullableTrimmedStringSchema,
  roleCodeSchema,
} from '../../access-control/dto/shared-access.dto';

export const createRoleSchema = z.object({
  name: z.string().trim().min(1),
  code: roleCodeSchema,
  scope: z.enum(['PLATFORM', 'MITRA']),
  description: nullableTrimmedStringSchema,
  isSystem: z.boolean().optional().default(false),
});

export type CreateRoleDto = z.infer<typeof createRoleSchema>;
