import { z } from 'zod';
import {
  nullableTrimmedStringSchema,
  roleCodeSchema,
} from '../../access-control/dto/shared-access.dto';

export const updateRoleSchema = z.object({
  name: z.string().trim().min(1).optional(),
  code: roleCodeSchema.optional(),
  scope: z.enum(['PLATFORM', 'MITRA']).optional(),
  description: nullableTrimmedStringSchema,
  isSystem: z.boolean().optional(),
});

export type UpdateRoleDto = z.infer<typeof updateRoleSchema>;
