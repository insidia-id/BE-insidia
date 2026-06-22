export const InsidiaRole = ['SUPER_ADMIN', 'ADMIN', 'USER', 'MENTOR'] as const;
export const MitraRole = ['AKADEMIK', 'GURU', 'MURID', 'WALI_MURID'] as const;
export const UserRole = [...InsidiaRole, ...MitraRole] as const;
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
