import type { ClassGroupStudent } from './class-group-students.types';
import type {
  CreateClassGroupStudentDto,
  UpdateClassGroupStudentDto,
} from './dto/class-group-student.dto';

export function serializeClassGroupStudent(record: ClassGroupStudent) {
  return {
    id: record.id,
    mitraId: record.mitraId,
    classGroupId: record.classGroupId,
    studentId: record.studentId,
    academicYearId: record.academicYearId,
    semesterId: record.semesterId,
    status: record.status,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    deletedAt: record.deletedAt,
    classGroup: record.classGroup,
    student: record.student,
    academicYear: record.academicYear,
    semester: record.semester,
  };
}

export function buildCreateClassGroupStudent(
  mitraId: string,
  dto: CreateClassGroupStudentDto,
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

    student: {
      connect: {
        id: dto.studentId,
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

export function buildUpdateClassGroupStudent(
  dto: UpdateClassGroupStudentDto,
  data: ClassGroupStudent,
) {
  return {
    ...(dto.classGroupId !== undefined
      ? {
          classGroup: {
            connect: {
              id: dto.classGroupId,
            },
          },
        }
      : {}),

    ...(dto.studentId !== undefined
      ? {
          student: {
            connect: {
              id: dto.studentId,
            },
          },
        }
      : {}),

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

    ...(dto.status !== undefined
      ? {
          status: dto.status,
        }
      : {
          status: data.status,
        }),
  };
}
