import { z } from 'zod';
import { nullableTrimmedStringSchema } from '../../access-control/dto/shared-access.dto';

export const updatePermissionSchema = z.object({
  name: z.string().trim().min(1).optional(),
  scope: z.enum(['INSIDIA', 'MITRA']).optional(),
  code: z
    .string()
    .trim()
    .min(1)
    .regex(
      /^[a-z0-9]+(\.[a-z0-9]+)*$/,
      'kode permission harus berupa lowercase dan dapat menggunakan titik sebagai pemisah',
    )
    .optional(),
  description: nullableTrimmedStringSchema,
});

export type UpdatePermissionDto = z.infer<typeof updatePermissionSchema>;
