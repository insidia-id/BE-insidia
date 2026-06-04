import { z } from 'zod';
const roleValues = [
  'SUPER_ADMIN',
  'ADMIN',
  'MENTOR',
  'USER',
  'AKADEMIK',
  'GURU',
  'MURID',
  'WALI_MURID',
] as const;
export const assignRolePermissionsSchema = z.object({
  permissionIds: z.array(z.string().trim().min(1)).default([]),
});

export type AssignRolePermissionsDto = z.infer<
  typeof assignRolePermissionsSchema
>;
export const BulkAssignRolePermissionsDto = z.object({
  role: z.enum(roleValues, 'role code tidak valid'),
  permissionIds: z.array(z.string().trim().min(1)).default([]),
});

export type BulkAssignRolePermissionsDto = z.infer<
  typeof BulkAssignRolePermissionsDto
>;
