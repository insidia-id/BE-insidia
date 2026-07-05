import { MitraRole, InsidiaRole } from '../enums/enums';
export type MitraRole = (typeof MitraRole)[keyof typeof MitraRole];
export type InsidiaRole = (typeof InsidiaRole)[keyof typeof InsidiaRole];

export type RoleCode = MitraRole | InsidiaRole | 'ALL';
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
