import type { Curriculum } from './curriculum.types';
import type {
  CreateCurriculumDto,
  UpdateCurriculumDto,
} from './dto/curriculum.dto';

export function serializeCurriculum(record: Curriculum) {
  return {
    id: record.id,
    mitraId: record.mitraId,
    name: record.name,
    code: record.code,
    description: record.description,
    status: record.status,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    deletedAt: record.deletedAt,
  };
}

export function buildCreateCurriculum(
  mitraId: string,
  dto: CreateCurriculumDto,
) {
  return {
    mitra: {
      connect: {
        id: mitraId,
      },
    },
    name: dto.name,
    code: dto.code ?? null,
    description: dto.description ?? null,
    status: dto.status,
  };
}

export function buildUpdateCurriculum(
  dto: UpdateCurriculumDto,
  curriculum: Curriculum,
) {
  return {
    ...(dto.name !== undefined
      ? { name: dto.name }
      : { name: curriculum.name }),

    ...(dto.code !== undefined
      ? { code: dto.code ?? null }
      : { code: curriculum.code }),

    ...(dto.description !== undefined
      ? { description: dto.description ?? null }
      : { description: curriculum.description }),

    ...(dto.status !== undefined
      ? { status: dto.status }
      : { status: curriculum.status }),
  };
}
