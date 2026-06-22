import { RoleScope } from '@prisma/client';

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
export type PermissionCode = {
  permission: {
    code: string;
  };
};
export type RoleWithPermissions = {
  code: string;
  permissions?: PermissionCode[];
};
export type MitraRolePermission = {
  mitraId: string;
  permission: {
    code: string;
  };
};
export type InsidiaAccessCarrier = {
  insidiaRole?: {
    role?: RoleWithPermissions | null;
  } | null;
};
function mapProfile(
  mitraRole: NonNullable<MitraAccessCarrier['mitraRoles']>[number],
) {
  switch (mitraRole.role.code) {
    case 'AKADEMIK':
      return mitraRole.academicProfile ?? undefined;

    case 'GURU':
      return mitraRole.guruProfile ?? undefined;

    case 'MURID':
      return mitraRole.muridProfile ?? undefined;

    case 'WALI_MURID':
      return mitraRole.waliProfile ?? undefined;

    default:
      return undefined;
  }
}
export type MitraAccessCarrier = {
  mitraRoles?:
    | {
        mitraId?: string;

        role: RoleWithPermissions & {
          mitraRolePermissions?: MitraRolePermission[];
        };

        mitra?: {
          id: string;
          name: string;
          slug: string;
        };

        academicProfile?: {
          position?: string | null;
          division?: string | null;
          note?: string | null;
        } | null;

        guruProfile?: {
          nip?: string | null;
          subject?: string | null;
          bio?: string | null;
        } | null;

        muridProfile?: {
          nis?: string | null;
          kelas?: string | null;
          jurusan?: string | null;
        } | null;

        waliProfile?: {
          pekerjaan?: string | null;
          alamat?: string | null;
        } | null;
      }[]
    | null;
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
    ...new Set(
      entity.mitraRoles?.flatMap((mitraRole) => [
        ...(mitraRole.role.permissions?.map(
          ({ permission }) => permission.code,
        ) ?? []),

        ...(mitraRole.role.mitraRolePermissions
          ?.filter((item) => item.mitraId === mitraRole.mitraId)
          .map(({ permission }) => permission.code) ?? []),
      ]) ?? [],
    ),
  ];
}

export function getMitraRoles(entity: MitraAccessCarrier) {
  return (
    entity.mitraRoles?.map((item) => ({
      roleCode: item.role.code ?? null,
      mitraId: item.mitraId ?? null,
      mitraName: item.mitra?.name ?? null,
      mitraSlug: item.mitra?.slug ?? null,
      profile: mapProfile(item),
    })) ?? []
  );
}

export function withMitraAccess<T extends MitraAccessCarrier>(entity: T) {
  return {
    ...entity,

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
