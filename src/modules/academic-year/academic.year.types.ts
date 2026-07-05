import { AcademicStatus } from '@prisma/client';
export type AcademicYear = {
  id: string;
  mitraId: string;
  name: string;
  startDate: Date;
  endDate: Date;
  status: AcademicStatus;
  createdAt: Date;
  updatedAt?: Date | null;
  deletedAt?: Date | null;
};
