import { z } from 'zod';
import { nullableTrimmedStringSchema } from '../../access-control/dto/shared-access.dto';

export const updatePermissionSchema = z.object({
  name: z.string().trim().min(1).optional(),
  scope: z.enum(['PLATFORM', 'MITRA']).optional(),
  description: nullableTrimmedStringSchema,
});

export type UpdatePermissionDto = z.infer<typeof updatePermissionSchema>;
