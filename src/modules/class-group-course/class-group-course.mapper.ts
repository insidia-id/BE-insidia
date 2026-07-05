import type { ClassGroupCourse } from './class-group-course.types';
import type {
  CreateClassGroupCourseDto,
  UpdateClassGroupCourseDto,
} from './dto/class-group-course.dto';

export function serializeClassGroupCourse(record: ClassGroupCourse) {
  return {
    id: record.id,
    mitraId: record.mitraId,
    classGroupId: record.classGroupId,
    courseMitraId: record.courseMitraId,
    teacherId: record.teacherId,
    academicYearId: record.academicYearId,
    semesterId: record.semesterId,
    status: record.status,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    deletedAt: record.deletedAt,
  };
}

export function buildCreateClassGroupCourse(
  mitraId: string,
  dto: CreateClassGroupCourseDto,
) {
  return {
    mitra: {
      connect: {
        id: mitraId,
      },
    },

    classGroup: {
      connect: {
        id: dto.classGroupId,
      },
    },

    courseMitra: dto.courseMitraId
      ? {
          connect: {
            id: dto.courseMitraId,
          },
        }
      : undefined,

    teacher: {
      connect: {
        id: dto.teacherId,
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

    status: dto.status,
  };
}

export function buildUpdateClassGroupCourse(
  dto: UpdateClassGroupCourseDto,
  data: ClassGroupCourse,
) {
  return {
    ...(dto.classGroupId !== undefined
      ? {
          classGroup: {
            connect: {
              id: dto.classGroupId ?? data.classGroupId,
            },
          },
        }
      : {}),

    ...(dto.courseMitraId !== undefined
      ? dto.courseMitraId === null
        ? {
            courseMitra: {
              disconnect: true,
            },
          }
        : {
            courseMitra: {
              connect: {
                id: dto.courseMitraId ?? data.courseMitraId!,
              },
            },
          }
      : {}),

    ...(dto.teacherId !== undefined
      ? {
          teacher: {
            connect: {
              id: dto.teacherId ?? data.teacherId,
            },
          },
        }
      : {}),

    ...(dto.academicYearId !== undefined
      ? {
          academicYear: {
            connect: {
              id: dto.academicYearId ?? data.academicYearId,
            },
          },
        }
      : {}),

    ...(dto.semesterId !== undefined
      ? {
          semester: {
            connect: {
              id: dto.semesterId ?? data.semesterId,
            },
          },
        }
      : {}),

    ...(dto.status !== undefined
      ? {
          status: dto.status ?? data.status,
        }
      : {
          status: data.status,
        }),
  };
}
