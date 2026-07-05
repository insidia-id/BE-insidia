import type { ClassGroup } from './class-group.types';
import type {
  CreateClassGroupDto,
  UpdateClassGroupDto,
} from './dto/class-group.dto';

export function serializeClassGroup(record: ClassGroup) {
  return {
    id: record.id,
    mitraId: record.mitraId,
    classId: record.classId,
    name: record.name,
    waliKelasId: record.waliKelasId,
    status: record.status,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    deletedAt: record.deletedAt,
    academicClass: record.academicClass,
    waliKelas: record.waliKelas,
  };
}

export function buildCreateClassGroup(
  mitraId: string,
  dto: CreateClassGroupDto,
) {
  return {
    mitra: {
      connect: {
        id: mitraId,
      },
    },
    academicClass: {
      connect: {
        id: dto.classId,
      },
    },
    name: dto.name,
    waliKelas: dto.waliKelasId
      ? {
          connect: {
            id: dto.waliKelasId,
          },
        }
      : undefined,
    status: dto.status,
  };
}

export function buildUpdateClassGroup(
  dto: UpdateClassGroupDto,
  classGroup: ClassGroup,
) {
  return {
    ...(dto.classId !== undefined
      ? {
          academicClass: {
            connect: {
              id: dto.classId,
            },
          },
        }
      : {}),

    ...(dto.name !== undefined
      ? { name: dto.name }
      : { name: classGroup.name }),

    ...(dto.waliKelasId !== undefined
      ? dto.waliKelasId === null
        ? {
            waliKelas: {
              disconnect: true,
            },
          }
        : {
            waliKelas: {
              connect: {
                id: dto.waliKelasId,
              },
            },
          }
      : {}),

    ...(dto.status !== undefined
      ? { status: dto.status }
      : { status: classGroup.status }),
  };
}
