import { z } from 'zod';
import { RoleScope } from '../../../shared/enums/enums';
import {
  roleCodeSchema,
  optionalNullableStringSchema,
} from '../../../shared/zod/zod.schemas';

export const BaseRoleSchema = z.object({
  name: z.string().trim().min(1),
  code: roleCodeSchema,
  scope: z.enum(RoleScope, {
    message: 'ruang lingkup role tidak valid',
  }),
  description: optionalNullableStringSchema,
  isSystem: z.boolean().optional().default(false),
});

export type CreateRoleDto = z.infer<typeof BaseRoleSchema>;
