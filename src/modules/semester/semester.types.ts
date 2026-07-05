import { AcademicStatus } from '@prisma/client';

export type Semester = {
  id: string;
  mitraId: string;
  academicYearId: string;
  name: string;
  startDate: Date;
  endDate: Date;
  status: AcademicStatus;
  createdAt: Date;
  updatedAt?: Date | null;
  deletedAt?: Date | null;
  academicYear?: {
    id: string;
    name: string;
  };
};
