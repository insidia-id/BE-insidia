import type { AcademicYear } from './academic.year.types';
import type {
  CreateAcademicYearDto,
  UpdateAcademicYearDto,
} from './dto/academic-year.dto';
export function serializeAcademicYear(record: AcademicYear) {
  return {
    id: record.id,
    mitraId: record.mitraId,
    name: record.name,
    startDate: record.startDate,
    endDate: record.endDate,
    status: record.status,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    deletedAt: record.deletedAt,
  };
}

export function buildCreateAcademicYear(
  mitraId: string,
  data: CreateAcademicYearDto,
) {
  return {
    mitra: { connect: { id: mitraId } },
    name: data.name,
    startDate: data.startDate,
    endDate: data.endDate,
    status: data.status,
  };
}

export function buildUpdateAcademicYear(
  dto: UpdateAcademicYearDto,
  data: AcademicYear,
) {
  return {
    ...(dto.name !== undefined ? { name: dto.name } : { name: data.name }),
    ...(dto.startDate !== undefined
      ? { startDate: dto.startDate }
      : { startDate: data.startDate }),
    ...(dto.endDate !== undefined
      ? { endDate: dto.endDate }
      : { endDate: data.endDate }),
    ...(dto.status !== undefined
      ? { status: dto.status }
      : { status: data.status }),
  };
}
