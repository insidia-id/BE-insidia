import type { Semester } from './semester.types';
import type { CreateSemesterDto, UpdateSemesterDto } from './dto/semester.dto';

export function serializeSemester(record: Semester) {
  return {
    id: record.id,
    mitraId: record.mitraId,
    academicYearId: record.academicYearId,
    name: record.name,
    startDate: record.startDate,
    endDate: record.endDate,
    status: record.status,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    deletedAt: record.deletedAt,
    academicYear: record.academicYear,
  };
}

export function buildCreateSemester(
  mitraId: string,
  academicYearId: string,
  dto: CreateSemesterDto,
) {
  return {
    mitra: {
      connect: {
        id: mitraId,
      },
    },
    academicYear: {
      connect: {
        id: academicYearId,
      },
    },
    name: dto.name,
    startDate: dto.startDate,
    endDate: dto.endDate,
    status: dto.status,
  };
}

export function buildUpdateSemester(
  dto: UpdateSemesterDto,
  semester: Semester,
) {
  return {
    ...(dto.academicYearId !== undefined
      ? {
          academicYear: {
            connect: {
              id: dto.academicYearId,
            },
          },
        }
      : {}),
    ...(dto.name !== undefined ? { name: dto.name } : { name: semester.name }),
    ...(dto.startDate !== undefined
      ? { startDate: dto.startDate }
      : { startDate: semester.startDate }),
    ...(dto.endDate !== undefined
      ? { endDate: dto.endDate }
      : { endDate: semester.endDate }),
    ...(dto.status !== undefined
      ? { status: dto.status }
      : { status: semester.status }),
  };
}
