import { z } from 'zod';
import { nullableTrimmedStringSchema } from '../../access-control/dto/shared-access.dto';
export const createModulePermissionSchema = z.object({
  module: z.string().trim().min(1, 'nama module permission wajib diisi'),
  description: nullableTrimmedStringSchema,
});

export const createPermissionSchema = z.object({
  moduleId: z.string().trim().min(1, 'id module permission wajib diisi'),
  name: z.string().trim().min(1, 'nama permission wajib diisi'),

  scope: z.enum(['INSIDIA', 'MITRA'], {
    message: 'ruang lingkup permission tidak valid',
  }),

  code: z
    .string()
    .trim()
    .min(1, 'kode permission wajib diisi')
    .regex(
      /^[a-z][a-z0-9]*\.[a-z][a-z0-9]*\.[a-z][a-z0-9]*$/,
      'kode permission harus mengikuti format resource.action.scope, contoh: user.update.insidia',
    ),

  description: nullableTrimmedStringSchema,
});
export type CreateModulePermissionDto = z.infer<
  typeof createModulePermissionSchema
>;
export type CreatePermissionDto = z.infer<typeof createPermissionSchema>;
