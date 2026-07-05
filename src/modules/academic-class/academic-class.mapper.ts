import type { AcademicClass } from './academic-class.types';
import type {
  CreateAcademicClassDto,
  UpdateAcademicClassDto,
} from './dto/academic-class.dto';

export function serializeAcademicClass(record: AcademicClass) {
  return {
    id: record.id,
    mitraId: record.mitraId,
    academicYearId: record.academicYearId,
    semesterId: record.semesterId,
    curriculumId: record.curriculumId,
    name: record.name,
    level: record.level,
    status: record.status,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    deletedAt: record.deletedAt,
    semester: record.semester,
    curriculum: record.curriculum,
  };
}

export function buildCreateAcademicClass(
  mitraId: string,
  dto: CreateAcademicClassDto,
) {
  return {
    mitra: {
      connect: {
        id: mitraId,
      },
    },
    academicYear: {
      connect: {
        id: dto.academicYearId,
      },
    },
    semester: {
      connect: {
        id: dto.semesterId,
      },
    },
    curriculum: {
      connect: {
        id: dto.curriculumId,
      },
    },
    name: dto.name,
    level: dto.level,
    status: dto.status,
  };
}

export function buildUpdateAcademicClass(
  dto: UpdateAcademicClassDto,
  data: AcademicClass,
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
    ...(dto.semesterId !== undefined
      ? {
          semester: {
            connect: {
              id: dto.semesterId,
            },
          },
        }
      : {}),
    ...(dto.curriculumId !== undefined
      ? {
          curriculum: {
            connect: {
              id: dto.curriculumId,
            },
          },
        }
      : {}),
    ...(dto.name !== undefined ? { name: dto.name } : { name: data.name }),
    ...(dto.level !== undefined ? { level: dto.level } : { level: data.level }),
    ...(dto.status !== undefined
      ? { status: dto.status }
      : { status: data.status }),
  };
}
