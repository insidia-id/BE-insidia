import { AcademicStatus } from '@prisma/client';

export type ClassGroupStudent = {
  id: string;
  mitraId: string;
  classGroupId: string;
  studentId: string;
  academicYearId: string;
  semesterId: string;
  status: AcademicStatus;
  createdAt: Date;
  updatedAt?: Date | null;
  deletedAt?: Date | null;
  classGroup?: {
    id: string;
    name: string;
  };
  student?: {
    id: string;
    name: string | null;
    email: string;
  };
  academicYear?: {
    id: string;
    name: string;
  };
  semester?: {
    id: string;
    name: string;
  };
};
