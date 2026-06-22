import { z } from 'zod';
import { BaseRoleSchema } from './create-role.dto';

export const updateRoleSchema = BaseRoleSchema.partial();

export type UpdateRoleDto = z.infer<typeof updateRoleSchema>;
