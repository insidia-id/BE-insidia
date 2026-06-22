import { z } from 'zod';
import {
  BaseCreateModulePermissionSchema,
  BaseCreatePermissionSchema,
} from './create-permission.dto';
export const BaseUpdatePermissionSchema = BaseCreatePermissionSchema.partial();
export type UpdateModulePermissionDto = z.infer<
  typeof BaseCreateModulePermissionSchema
>;
export type UpdatePermissionDto = z.infer<typeof BaseCreatePermissionSchema>;
