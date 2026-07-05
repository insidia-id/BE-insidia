import { AcademicStatus } from '@prisma/client';

export type AcademicClass = {
  id: string;
  mitraId: string;
  academicYearId: string;
  semesterId: string;
  curriculumId: string;
  name: string;
  level: string;
  status: AcademicStatus;
  createdAt: Date;
  updatedAt?: Date | null;
  deletedAt?: Date | null;
  semester?: {
    id: string;
    name: string;
  };
  curriculum?: {
    id: string;
    name: string;
  };
};
