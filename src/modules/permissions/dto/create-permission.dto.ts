import { z } from 'zod';
import { optionalNullableStringSchema } from '../../../shared/zod/zod.schemas';
import { RoleScope } from '../../../shared/enums/enums';
export const BaseCreateModulePermissionSchema = z.object({
  module: z.string().trim().min(1, 'nama module permission wajib diisi'),
  scope: z.enum(RoleScope, {
    message: 'ruang lingkup permission tidak valid',
  }),
  description: optionalNullableStringSchema,
});

export const BaseCreatePermissionSchema = z.object({
  moduleId: z.string().trim().min(1, 'id module permission wajib diisi'),
  name: z.string().trim().min(1, 'nama permission wajib diisi'),

  code: z
    .string()
    .trim()
    .min(1, 'kode permission wajib diisi')
    .regex(
      /^[a-z][a-z0-9]*\.[a-z][a-z0-9]*\.[a-z][a-z0-9]*$/,
      'kode permission harus mengikuti format resource.action.scope, contoh: user.update.insidia',
    ),

  description: optionalNullableStringSchema,
});

export const bulkPermissionSchema = z.object({
  module: z.string().min(1, 'module wajib diisi'),

  moduleDescription: z.string().optional(),

  scope: z.enum(RoleScope, {
    message: 'ruang lingkup permission tidak valid',
  }),

  permissionName: z.string().min(1, 'permission name wajib'),

  permissionCode: z.string().min(1, 'permission code wajib'),

  permissionDescription: z.string().optional(),
});

export type BulkPermissionDto = z.infer<typeof bulkPermissionSchema>;

export type CreateModulePermissionDto = z.infer<
  typeof BaseCreateModulePermissionSchema
>;
export type CreatePermissionDto = z.infer<typeof BaseCreatePermissionSchema>;
