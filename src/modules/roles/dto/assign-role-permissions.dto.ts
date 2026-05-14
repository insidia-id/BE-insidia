import { z } from 'zod';

export const assignRolePermissionsSchema = z.object({
  permissionIds: z.array(z.string().trim().min(1)).default([]),
});

export type AssignRolePermissionsDto = z.infer<
  typeof assignRolePermissionsSchema
>;
