import { Prisma, RoleScope } from '@prisma/client';

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

export function getUserRoleScopeWhere(
  scope: RoleScope = RoleScope.INSIDIA,
  mitraId?: string,
): Prisma.UserWhereInput {
  if (scope === RoleScope.INSIDIA) {
    return {
      insidiaRole: {
        is: {
          role: {
            scope: RoleScope.INSIDIA,
          },
        },
      },
    };
  }

  return {
    mitraRoles: {
      is: {
        ...(mitraId ? { mitraId } : {}),
        role: {
          scope,
        },
      },
    },
  };
}

export function getUserRoleWhereByScope({
  scope,
  roles,
}: {
  scope: RoleScope;
  roles?: string[];
}): Prisma.UserWhereInput {
  const roleWhere: Prisma.RoleWhereInput = {
    scope,
    ...(roles?.length
      ? {
          code: {
            notIn: roles,
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
      is: {
        role: roleWhere,
      },
    },
  };
}
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
  id: true,
  name: true,
  email: true,
  status: true,
  image: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
  insidiaRole: {
    select: {
      id: true,
      roleId: true,
      role: {
        select: {
          id: true,
          scope: true,
          code: true,
        },
      },
    },
  },
  mitraRoles: {
    select: {
      id: true,
      roleId: true,
      mitraId: true,
      role: {
        select: {
          id: true,
          scope: true,
          code: true,
        },
      },
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
