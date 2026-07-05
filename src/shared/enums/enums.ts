export const InsidiaRole = {
  ADMIN: 'ADMIN',
  SUPER_ADMIN: 'SUPER_ADMIN',
  MENTOR: 'MENTOR',
  USER: 'USER',
} as const;
export const MitraRole = {
  GURU: 'GURU',
  MURID: 'MURID',
  AKADEMIK: 'AKADEMIK',
  WALI_MURID: 'WALI_MURID',
} as const;
export const UserRole = { ...InsidiaRole, ...MitraRole } as const;
export const userStatusValues = ['ACTIVE', 'BANNED'] as const;
export const Gender = ['MALE', 'FEMALE'] as const;
export const RoleScope = ['INSIDIA', 'MITRA'] as const;
export const Religion = [
  'ISLAM',
  'CHRISTIAN',
  'CATHOLIC',
  'HINDU',
  'BUDDHIST',
  'CONFUCIAN',
  'OTHER',
] as const;
