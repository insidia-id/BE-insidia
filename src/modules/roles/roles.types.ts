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
