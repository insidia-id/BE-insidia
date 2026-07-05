import { AcademicStatus } from '@prisma/client';
export type Curriculum = {
  id: string;
  mitraId: string;
  name: string;
  code: string | null;
  description: string | null;
  status: AcademicStatus;
  createdAt: Date;
  updatedAt?: Date | null;
  deletedAt?: Date | null;
};
