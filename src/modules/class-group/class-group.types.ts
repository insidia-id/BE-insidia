import { AcademicStatus } from '@prisma/client';

export type ClassGroup = {
  id: string;
  mitraId: string;
  classId: string;
  name: string;
  waliKelasId?: string | null;
  status: AcademicStatus;
  createdAt: Date;
  updatedAt?: Date | null;
  deletedAt?: Date | null;
  academicClass?: {
    id: string;
    name: string;
  };
  waliKelas?: {
    id: string;
    name: string | null;
    email: string;
  } | null;
};
