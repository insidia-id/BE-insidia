import { AcademicStatus } from '@prisma/client';

export type ClassGroupCourse = {
  id: string;
  mitraId: string;
  classGroupId: string;
  courseMitraId: string | null;
  teacherId: string;
  academicYearId: string;
  semesterId: string;
  status: AcademicStatus;
  createdAt: Date;
  updatedAt?: Date | null;
  deletedAt?: Date | null;
};
