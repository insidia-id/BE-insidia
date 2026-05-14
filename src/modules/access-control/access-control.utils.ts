import { RoleScope } from '@prisma/client';

export const SYSTEM_PLATFORM_ROLES = [
  {
    code: 'SUPER_ADMIN',
    name: 'Super Admin',
    scope: RoleScope.PLATFORM,
    description: 'Akses penuh ke seluruh fitur platform',
    isSystem: true,
  },
  {
    code: 'ADMIN',
    name: 'Admin',
    scope: RoleScope.PLATFORM,
    description: 'Mengelola operasional platform',
    isSystem: true,
  },
  {
    code: 'MENTOR',
    name: 'Mentor',
    scope: RoleScope.PLATFORM,
    description: 'Peran mentor di platform',
    isSystem: true,
  },
  {
    code: 'USER',
    name: 'User',
    scope: RoleScope.PLATFORM,
    description: 'Peran default pengguna platform',
    isSystem: true,
  },
] as const;

export const SYSTEM_MITRA_ROLES = [
  {
    code: 'AKADEMIK',
    name: 'Akademik',
    scope: RoleScope.MITRA,
    description: 'Peran akademik pada mitra',
    isSystem: true,
  },
  {
    code: 'GURU',
    name: 'Guru',
    scope: RoleScope.MITRA,
    description: 'Peran guru pada mitra',
    isSystem: true,
  },
  {
    code: 'MURID',
    name: 'Murid',
    scope: RoleScope.MITRA,
    description: 'Peran murid pada mitra',
    isSystem: true,
  },
  {
    code: 'WALI_MURID',
    name: 'Wali Murid',
    scope: RoleScope.MITRA,
    description: 'Peran wali murid pada mitra',
    isSystem: true,
  },
] as const;

export const SYSTEM_ROLE_SEEDS = [
  ...SYSTEM_PLATFORM_ROLES,
  ...SYSTEM_MITRA_ROLES,
] as const;

export type PlatformAccessCarrier = {
  platformRole?: {
    role?: {
      code: string;
      permissions?: Array<{
        permission: {
          code: string;
        };
      }>;
    } | null;
  } | null;
};

export function normalizeRoleCode(code: string) {
  return code.trim().toUpperCase().replace(/\s+/g, '_');
}

export function getPlatformRoleCode(entity: PlatformAccessCarrier) {
  return entity.platformRole?.role?.code ?? null;
}

export function getPlatformPermissionCodes(entity: PlatformAccessCarrier) {
  return (
    entity.platformRole?.role?.permissions?.map(
      ({ permission }) => permission.code,
    ) ?? []
  );
}

export function withPlatformAccess<T extends PlatformAccessCarrier>(entity: T) {
  return {
    ...entity,
    role: getPlatformRoleCode(entity),
    permissions: getPlatformPermissionCodes(entity),
  };
}
