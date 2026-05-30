export type UserPolicyParams = {
  targetRoleCode: string | null;
  targetScope: 'INSIDIA' | 'MITRA';
};
export type insidiaRole = 'SUPER_ADMIN' | 'ADMIN' | 'USER' | 'MENTOR';
export type actorRole = {
  insidiaRole: {
    role: {
      id: string;
      code: string;
    };
  } | null;
  mitraRoles: {
    role: {
      id: string;
      code: string;
    };
  } | null;
};
export type Scope = 'INSIDIA' | 'MITRA';
