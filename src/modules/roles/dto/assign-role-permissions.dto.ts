import { z } from 'zod';
import { UserRole } from '../../../shared/enums/enums';
export const assignRolePermissionsSchema = z.object({
  permissionIds: z.array(z.string().trim().min(1)).default([]),
});

export type AssignRolePermissionsDto = z.infer<
  typeof assignRolePermissionsSchema
>;
export const BulkAssignRolePermissionsDto = z.object({
  role: z.enum(UserRole, {
    message: 'role code tidak valid',
  }),
  permissionIds: z.array(z.string().trim().min(1)).default([]),
});

export type BulkAssignRolePermissionsDto = z.infer<
  typeof BulkAssignRolePermissionsDto
>;
