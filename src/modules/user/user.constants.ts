import { Prisma, RoleScope } from '@prisma/client';
import { RoleCode } from './user.types';

export const adminRoles = ['SUPER_ADMIN', 'ADMIN'] as const;
export const adminRoleSet = new Set<string>(adminRoles);
export const adminAllowedTargetRoleCodes = new Set(['USER', 'MENTOR']);
export const AkademikAllowedTargetRoleCodes = new Set([
  'MURID',
  'GURU',
  'WALI_MURID',
  'AKADEMIK',
]);
export type UserFilter = 'all' | 'available' | 'deleted';
export type Scope = 'INSIDIA' | 'MITRA';
export function getUserFilterWhere(
  filter: UserFilter = 'available',
): Prisma.UserWhereInput {
  if (filter === 'deleted') {
    return {
      deletedAt: {
        not: null,
      },
    };
  }

  if (filter === 'all') {
    return {};
  }

  return {
    deletedAt: null,
  };
}
export function getUserRoleWhereByScope({
  scope,
  mitraId,
  roleCode,
  excludeRoles,
}: {
  scope: RoleScope;
  mitraId?: string | null;
  roleCode?: RoleCode;
  excludeRoles?: RoleCode[];
}): Prisma.UserWhereInput {
  const roleWhere: Prisma.RoleWhereInput = {
    scope,
    ...(roleCode
      ? {
          code: roleCode,
        }
      : excludeRoles?.length
        ? {
            code: {
              notIn: excludeRoles,
            },
          }
        : {}),
  };

  if (scope === RoleScope.INSIDIA) {
    return {
      insidiaRole: {
        is: {
          role: roleWhere,
        },
      },
    };
  }

  return {
    mitraRoles: {
      some: {
        ...(mitraId ? { mitraId } : {}),
        role: roleWhere,
      },
    },
  };
}
export const MitraSelect = {
  id: true,
  name: true,
  slug: true,
};
export const userRole = {
  insidiaRole: {
    select: {
      role: {
        select: {
          id: true,
          code: true,
        },
      },
    },
  },
  mitraRoles: {
    select: {
      mitraId: true,
      role: {
        select: {
          id: true,
          code: true,
        },
      },
    },
  },
};

const userInsidiaRoleSelect = {
  id: true,
  roleId: true,
  role: {
    select: {
      id: true,
      name: true,
      code: true,
      scope: true,
    },
  },
} satisfies Prisma.UserInsidiaRoleSelect;
const userMitraRoleSelect = {
  id: true,
  roleId: true,
  mitraId: true,
  mitra: {
    select: MitraSelect,
  },
  guruProfile: true,
  muridProfile: true,
  waliProfile: true,
  academicProfile: true,
  role: {
    select: {
      id: true,
      name: true,
      code: true,
      scope: true,
    },
  },
} satisfies Prisma.UserMitraRoleSelect;
export const adminUserListSelect = {
  email: true,
  name: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
  status: true,
  id: true,
  image: true,
  insidiaRole: {
    select: {
      role: {
        select: {
          id: true,
          code: true,
        },
      },
    },
  },
  mitraRoles: {
    select: {
      mitra: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      role: {
        select: {
          id: true,
          code: true,
        },
      },
      academicProfile: true,
      guruProfile: true,
      muridProfile: true,
      waliProfile: true,
    },
  },
} satisfies Prisma.UserSelect;

export const adminUserSelect = {
  id: true,
  name: true,
  email: true,
  normalizedEmail: true,
  emailVerified: true,
  phone: true,
  phoneVerifiedAt: true,
  image: true,
  status: true,
  bio: true,
  websiteUrl: true,
  socialLinks: true,
  createdById: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
  insidiaRole: {
    select: userInsidiaRoleSelect,
  },
  mitraRoles: {
    select: userMitraRoleSelect,
  },
} satisfies Prisma.UserSelect;

export const adminUserCreatedSelect = {
  id: true,
  name: true,
  email: true,
  status: true,
  createdAt: true,
  insidiaRole: {
    select: userInsidiaRoleSelect,
  },
  mitraRoles: {
    select: userMitraRoleSelect,
  },
} satisfies Prisma.UserSelect;

export type AdminUser = Prisma.UserGetPayload<{
  select: typeof adminUserSelect;
}>;

export const userPermisionsCode = {
  createInsidiaUser: 'user.create.insidia',
  createMitraUser: 'user.create.mitra',
  viewInsidiaUser: 'user.view.insidia',
  viewMitraUser: 'user.view.mitra',

  updateInsidiaUser: 'user.update.insidia',
  updateMitraUser: 'user.update.mitra',
  deleteInsidiaUser: 'user.delete.insidia',
  deleteMitraUser: 'user.delete.mitra',
} as const;
