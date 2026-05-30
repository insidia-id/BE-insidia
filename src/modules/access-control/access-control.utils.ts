import { RoleScope } from '@prisma/client';
import { ProfileUser } from '../auth/auth.repository.types';

export const SYSTEM_INSIDIA_ROLES = [
  {
    code: 'SUPER_ADMIN',
    name: 'Super Admin',
    scope: RoleScope.INSIDIA,
    description: 'Akses penuh ke seluruh fitur Insidia',
    isSystem: true,
  },
  {
    code: 'ADMIN',
    name: 'Admin',
    scope: RoleScope.INSIDIA,
    description: 'Mengelola operasional Insidia',
    isSystem: true,
  },
  {
    code: 'MENTOR',
    name: 'Mentor',
    scope: RoleScope.INSIDIA,
    description: 'Peran mentor di Insidia',
    isSystem: true,
  },
  {
    code: 'USER',
    name: 'User',
    scope: RoleScope.INSIDIA,
    description: 'Peran default pengguna Insidia',
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
  ...SYSTEM_INSIDIA_ROLES,
  ...SYSTEM_MITRA_ROLES,
] as const;

export type InsidiaAccessCarrier = {
  insidiaRole?: {
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
export type MitraAccessCarrier = {
  mitraRoles?: {
    mitraId?: string;
    role: {
      code: string;
      permissions?: Array<{
        permission: {
          code: string;
        };
      }>;
      mitraRolePermissions?: Array<{
        mitraId: string;
        permission: {
          code: string;
        };
      }>;
    };
    mitra: {
      id: string;
      name: string;
      slug: string;
    };
  } | null;
};
export function normalizeRoleCode(code: string) {
  return code.trim().toUpperCase().replace(/\s+/g, '_');
}

export function getInsidiaRoleCode(entity: InsidiaAccessCarrier) {
  return entity.insidiaRole?.role?.code ?? null;
}
export function getInsidiaPermissionCodes(entity: InsidiaAccessCarrier) {
  return (
    entity.insidiaRole?.role?.permissions?.map(
      ({ permission }) => permission.code,
    ) ?? []
  );
}
export function getMitraPermissionCodes(entity: MitraAccessCarrier) {
  return [
    ...(entity.mitraRoles?.role.permissions?.map(
      ({ permission }) => permission.code,
    ) ?? []),

    ...(entity.mitraRoles?.role.mitraRolePermissions
      ?.filter((item) => item.mitraId === entity.mitraRoles?.mitraId)
      .map(({ permission }) => permission.code) ?? []),
  ];
}
export function getMitraRoles(entity: MitraAccessCarrier) {
  return {
    roleCode: entity.mitraRoles?.role.code ?? null,
    mitraId: entity.mitraRoles?.mitraId ?? null,
    mitraName: entity.mitraRoles?.mitra.name ?? null,
    mitraSlug: entity.mitraRoles?.mitra.slug ?? null,
  };
}
export function withMitraAccess<T extends MitraAccessCarrier>(entity: T) {
  return {
    mitraRoles: getMitraRoles(entity),
    permissions: getMitraPermissionCodes(entity),
  };
}
export function withInsidiaAccess<T extends InsidiaAccessCarrier>(entity: T) {
  return {
    ...entity,
    role: getInsidiaRoleCode(entity),
    permissions: getInsidiaPermissionCodes(entity),
  };
}
// export function getProfileByRole(user: ProfileUser) {
//   const roleCode = getInsidiaRoleCode(user);

//   switch (roleCode) {
//     case 'GURU':
//       return user.guruProfile;

//     case 'MURID':
//       return user.muridProfile;

//     case 'WALI_MURID':
//       return user.waliProfile;

//     case 'MENTOR':
//       return user.mentorProfile;

//     case 'AKADEMIK':
//       return user.academicProfile;

//     default:
//       return null;
//   }
// }
