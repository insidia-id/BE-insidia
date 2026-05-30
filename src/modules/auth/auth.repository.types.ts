import { Prisma } from '@prisma/client';

export const permissionCodeSelect = {
  permission: {
    select: {
      code: true,
    },
  },
} satisfies Prisma.RolePermissionSelect;

export const mitraPermissionCodeSelect = {
  mitraId: true,
  permission: {
    select: {
      code: true,
    },
  },
} satisfies Prisma.MitraRolePermissionSelect;
export const authSessionUserSelect = {
  id: true,
  email: true,
  emailVerified: true,
  name: true,
  status: true,
  image: true,
  insidiaRole: {
    select: {
      role: {
        select: {
          code: true,
        },
      },
    },
  },
  mitraRoles: {
    select: {
      role: {
        select: {
          code: true,
        },
      },
    },
  },
} satisfies Prisma.UserSelect;

export const profileUserSelect = {
  id: true,
  email: true,
  name: true,
  status: true,
  image: true,
  insidiaRole: {
    select: {
      role: {
        select: {
          code: true,
          permissions: {
            select: permissionCodeSelect,
          },
        },
      },
    },
  },

  mitraRoles: {
    select: {
      mitraId: true,
      role: {
        select: {
          code: true,
          permissions: {
            select: permissionCodeSelect,
          },
          mitraRolePermissions: {
            select: mitraPermissionCodeSelect,
          },
        },
      },
      mitra: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  },
} satisfies Prisma.UserSelect;

export const sessionSelect = {
  status: true,
  insidiaRole: {
    select: {
      role: {
        select: {
          code: true,
        },
      },
    },
  },

  mitraRoles: {
    select: {
      role: {
        select: {
          code: true,
        },
      },
      mitra: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  },
};
export type ProfileUser = Prisma.UserGetPayload<{
  select: typeof profileUserSelect;
}>;
export const authUserStatusSelect = {
  id: true,
  status: true,
} satisfies Prisma.UserSelect;

export type SessionUser = Prisma.UserGetPayload<{
  select: typeof authSessionUserSelect;
}>;

export type AuthUserStatus = Prisma.UserGetPayload<{
  select: typeof authUserStatusSelect;
}>;

export type CreateGoogleUserInput = {
  normalizedEmail: string;
  name?: string | null;
  image?: string | null;
  emailVerified?: Date | null;
};

export type UpdateGoogleUserInput = Pick<
  Prisma.UserUpdateInput,
  'name' | 'image' | 'emailVerified'
>;

export type CreateSessionInput = {
  id: string;
  userId: string;
  refreshTokenHash: string;
  tokenVersion: number;
  ipAddress: string;
  userAgent?: string;
  expiresAt: Date;
};
