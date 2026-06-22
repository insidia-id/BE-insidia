import { MitraRole, InsidiaRole } from '../../shared/enums/enums';

export type UserPolicyParams = {
  targetRoleCode: string | null;
  targetScope: 'INSIDIA' | 'MITRA';
};

export type mitraRole = (typeof MitraRole)[number];
export type insidiaRole = (typeof InsidiaRole)[number];

export type RoleCode = mitraRole | insidiaRole | 'ALL';
export type actorRole = {
  insidiaRole: {
    role: {
      id: string;
      code: string;
    };
  } | null;
  mitraRoles:
    | {
        mitraId?: string;
        role: {
          id: string;
          code: string;
        };
      }[]
    | null;
};
export type Scope = 'INSIDIA' | 'MITRA';
