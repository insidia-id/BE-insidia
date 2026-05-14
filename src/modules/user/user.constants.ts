import { Prisma, RoleScope } from '@prisma/client';
import id from 'zod/v4/locales/id.js';

export const adminRoles = ['SUPER_ADMIN', 'ADMIN'] as const;
export const adminRoleSet = new Set<string>(adminRoles);
export type UserFilter = 'all' | 'available' | 'deleted';
export type Scope = 'PLATFORM' | 'MITRA';

export function getUserRoleScopeWhere(
  scope: RoleScope = RoleScope.PLATFORM,
): Prisma.UserWhereInput {
  if (scope === RoleScope.PLATFORM) {
    return {
      platformRole: {
        is: {
          role: {
            scope: RoleScope.PLATFORM,
          },
        },
      },
    };
  }

  return {
    mitraRoles: {
      some: {
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

  if (scope === RoleScope.PLATFORM) {
    return {
      platformRole: {
        is: {
          role: roleWhere,
        },
      },
    };
  }

  return {
    mitraRoles: {
      some: {
        role: roleWhere,
      },
    },
  };
}
export const userRole = {
  platformRole: {
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
      role: {
        select: {
          id: true,
          code: true,
        },
      },
    },
  },
};
const permissionSummarySelect = {
  id: true,
  name: true,
  code: true,
  scope: true,
  description: true,
} satisfies Prisma.PermissionSelect;

const roleSummarySelect = {
  id: true,
  name: true,
  code: true,
  scope: true,
  description: true,
  isSystem: true,
  permissions: {
    select: {
      permission: {
        select: permissionSummarySelect,
      },
    },
  },
} satisfies Prisma.RoleSelect;

const userPlatformRoleSelect = {
  id: true,
  roleId: true,
  role: {
    select: roleSummarySelect,
  },
} satisfies Prisma.UserPlatformRoleSelect;

export const adminUserListSelect = {
  id: true,
  name: true,
  email: true,
  status: true,
  image: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
  platformRole: {
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
  platformRole: {
    select: userPlatformRoleSelect,
  },
} satisfies Prisma.UserSelect;

export const adminUserCreatedSelect = {
  id: true,
  name: true,
  email: true,
  status: true,
  createdAt: true,
  platformRole: {
    select: userPlatformRoleSelect,
  },
} satisfies Prisma.UserSelect;

export type AdminUser = Prisma.UserGetPayload<{
  select: typeof adminUserSelect;
}>;
