import { Injectable } from '@nestjs/common';
import { AcademicStatus, Prisma, RoleScope } from '@prisma/client';
import { PrismaService } from '../../infrastruktur/prisma/prisma.service';
import { curriculumSelect } from './curriculum/curriculum.constants';
const userSummarySelect = {
  id: true,
  name: true,
  email: true,
  status: true,
} satisfies Prisma.UserSelect;

const mitraRoleSummarySelect = {
  id: true,
  mitraId: true,
  role: {
    select: {
      id: true,
      code: true,
      name: true,
      scope: true,
    },
  },
} satisfies Prisma.UserMitraRoleSelect;

export const mitraAcademicActorSelect = {
  id: true,
  name: true,
  email: true,
  status: true,
  insidiaRole: {
    select: {
      role: {
        select: {
          id: true,
          code: true,
          scope: true,
        },
      },
    },
  },
  mitraRoles: {
    select: mitraRoleSummarySelect,
  },
} satisfies Prisma.UserSelect;

const academicYearSummarySelect = {
  id: true,
  mitraId: true,
  name: true,
  startDate: true,
  endDate: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
} satisfies Prisma.AcademicYearSelect;

export const academicYearSelect = {
  ...academicYearSummarySelect,
} satisfies Prisma.AcademicYearSelect;

export const semesterSelect = {
  id: true,
  mitraId: true,
  academicYearId: true,
  name: true,
  startDate: true,
  endDate: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
  academicYear: {
    select: academicYearSummarySelect,
  },
} satisfies Prisma.SemesterSelect;

export const subjectSelect = {
  id: true,
  mitraId: true,
  curriculumId: true,
  title: true,
  slug: true,
  code: true,
  description: true,
  scope: true,
  academicStatus: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
  curriculum: {
    select: curriculumSelect,
  },
} satisfies Prisma.CourseSelect;

export const academicClassSelect = {
  id: true,
  mitraId: true,
  academicYearId: true,
  semesterId: true,
  curriculumId: true,
  name: true,
  level: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
  academicYear: {
    select: academicYearSummarySelect,
  },
  semester: {
    select: {
      id: true,
      name: true,
      status: true,
    },
  },
  curriculum: {
    select: {
      id: true,
      name: true,
      code: true,
      status: true,
    },
  },
} satisfies Prisma.AcademicClassSelect;

export const classGroupSelect = {
  id: true,
  mitraId: true,
  classId: true,
  name: true,
  waliKelasId: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
  academicClass: {
    select: academicClassSelect,
  },
  waliKelas: {
    select: userSummarySelect,
  },
} satisfies Prisma.ClassGroupSelect;

export const classGroupCourseSelect = {
  id: true,
  mitraId: true,
  classGroupId: true,
  courseId: true,
  teacherId: true,
  academicYearId: true,
  semesterId: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
  classGroup: {
    select: classGroupSelect,
  },
  course: {
    select: subjectSelect,
  },
  teacher: {
    select: userSummarySelect,
  },
  academicYear: {
    select: academicYearSummarySelect,
  },
  semester: {
    select: {
      id: true,
      name: true,
      status: true,
    },
  },
} satisfies Prisma.ClassGroupCourseSelect;

export const classGroupStudentSelect = {
  id: true,
  mitraId: true,
  classGroupId: true,
  studentId: true,
  academicYearId: true,
  semesterId: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
  classGroup: {
    select: classGroupSelect,
  },
  student: {
    select: userSummarySelect,
  },
  academicYear: {
    select: academicYearSummarySelect,
  },
  semester: {
    select: {
      id: true,
      name: true,
      status: true,
    },
  },
} satisfies Prisma.ClassGroupStudentSelect;

export const learningMaterialSelect = {
  id: true,
  mitraId: true,
  classGroupId: true,
  courseId: true,
  teacherId: true,
  title: true,
  description: true,
  filePath: true,
  fileType: true,
  fileSize: true,
  uploadedAt: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
  classGroup: {
    select: classGroupSelect,
  },
  course: {
    select: subjectSelect,
  },
  teacher: {
    select: userSummarySelect,
  },
} satisfies Prisma.LearningMaterialSelect;

@Injectable()
export class MitraAcademicRepository {
  constructor(private readonly prisma: PrismaService) {}

  findMitraById(id: string) {
    return this.prisma.mitra.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        slug: true,
        deletedAt: true,
      },
    });
  }

  findActorContext(userId: string, mitraId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        ...mitraAcademicActorSelect,
        mitraRoles: {
          where: {
            mitraId,
          },
          select: mitraRoleSummarySelect,
        },
      },
    });
  }

  findUserMitraRoleByCode(userId: string, mitraId: string, roleCode: string) {
    return this.prisma.userMitraRole.findFirst({
      where: {
        userId,
        mitraId,
        role: {
          code: roleCode,
        },
      },
      select: mitraRoleSummarySelect,
    });
  }

  findActiveAcademicYear(mitraId: string) {
    return this.prisma.academicYear.findFirst({
      where: {
        mitraId,
        status: AcademicStatus.ACTIVE,
        deletedAt: null,
      },
      orderBy: {
        startDate: 'desc',
      },
      select: academicYearSelect,
    });
  }

  findActiveSemester(mitraId: string, academicYearId?: string) {
    return this.prisma.semester.findFirst({
      where: {
        mitraId,
        academicYearId,
        status: AcademicStatus.ACTIVE,
        deletedAt: null,
      },
      orderBy: {
        startDate: 'desc',
      },
      select: semesterSelect,
    });
  }

  createAcademicYear(data: Prisma.AcademicYearCreateInput) {
    return this.prisma.academicYear.create({
      data,
      select: academicYearSelect,
    });
  }

  findAcademicYears(mitraId: string) {
    return this.prisma.academicYear.findMany({
      where: {
        mitraId,
        deletedAt: null,
      },
      orderBy: {
        startDate: 'desc',
      },
      select: academicYearSelect,
    });
  }

  findAcademicYearById(id: string) {
    return this.prisma.academicYear.findUnique({
      where: { id },
      select: academicYearSelect,
    });
  }

  updateAcademicYear(id: string, data: Prisma.AcademicYearUpdateInput) {
    return this.prisma.academicYear.update({
      where: { id },
      data,
      select: academicYearSelect,
    });
  }

  createSemester(data: Prisma.SemesterCreateInput) {
    return this.prisma.semester.create({
      data,
      select: semesterSelect,
    });
  }

  findSemesters(mitraId: string) {
    return this.prisma.semester.findMany({
      where: {
        mitraId,
        deletedAt: null,
      },
      orderBy: [{ academicYear: { startDate: 'desc' } }, { startDate: 'desc' }],
      select: semesterSelect,
    });
  }

  findSemesterById(id: string) {
    return this.prisma.semester.findUnique({
      where: { id },
      select: semesterSelect,
    });
  }

  updateSemester(id: string, data: Prisma.SemesterUpdateInput) {
    return this.prisma.semester.update({
      where: { id },
      data,
      select: semesterSelect,
    });
  }

  findSubjectById(id: string) {
    return this.prisma.course.findUnique({
      where: { id },
      select: subjectSelect,
    });
  }

  findSubjectBySlug(slug: string) {
    return this.prisma.course.findUnique({
      where: { slug },
      select: subjectSelect,
    });
  }

  createSubject(data: Prisma.CourseCreateInput) {
    return this.prisma.course.create({
      data,
      select: subjectSelect,
    });
  }

  findSubjects(mitraId: string) {
    return this.prisma.course.findMany({
      where: {
        mitraId,
        scope: RoleScope.MITRA,
        deletedAt: null,
      },
      orderBy: {
        title: 'asc',
      },
      select: subjectSelect,
    });
  }

  updateSubject(id: string, data: Prisma.CourseUpdateInput) {
    return this.prisma.course.update({
      where: { id },
      data,
      select: subjectSelect,
    });
  }

  createAcademicClass(data: Prisma.AcademicClassCreateInput) {
    return this.prisma.academicClass.create({
      data,
      select: academicClassSelect,
    });
  }

  findAcademicClasses(mitraId: string) {
    return this.prisma.academicClass.findMany({
      where: {
        mitraId,
        deletedAt: null,
      },
      orderBy: [{ academicYear: { startDate: 'desc' } }, { name: 'asc' }],
      select: academicClassSelect,
    });
  }

  findAcademicClassById(id: string) {
    return this.prisma.academicClass.findUnique({
      where: { id },
      select: academicClassSelect,
    });
  }

  updateAcademicClass(id: string, data: Prisma.AcademicClassUpdateInput) {
    return this.prisma.academicClass.update({
      where: { id },
      data,
      select: academicClassSelect,
    });
  }

  createClassGroup(data: Prisma.ClassGroupCreateInput) {
    return this.prisma.classGroup.create({
      data,
      select: classGroupSelect,
    });
  }

  findClassGroups(mitraId: string) {
    return this.prisma.classGroup.findMany({
      where: {
        mitraId,
        deletedAt: null,
      },
      orderBy: [{ academicClass: { name: 'asc' } }, { name: 'asc' }],
      select: classGroupSelect,
    });
  }

  findClassGroupById(id: string) {
    return this.prisma.classGroup.findUnique({
      where: { id },
      select: classGroupSelect,
    });
  }

  updateClassGroup(id: string, data: Prisma.ClassGroupUpdateInput) {
    return this.prisma.classGroup.update({
      where: { id },
      data,
      select: classGroupSelect,
    });
  }

  createClassGroupCourse(data: Prisma.ClassGroupCourseCreateInput) {
    return this.prisma.classGroupCourse.create({
      data,
      select: classGroupCourseSelect,
    });
  }

  findClassGroupCourses(params: {
    mitraId: string;
    classGroupId?: string;
    courseId?: string;
    teacherId?: string;
    academicYearId?: string;
    semesterId?: string;
  }) {
    return this.prisma.classGroupCourse.findMany({
      where: {
        mitraId: params.mitraId,
        ...(params.classGroupId ? { classGroupId: params.classGroupId } : {}),
        ...(params.courseId ? { courseId: params.courseId } : {}),
        ...(params.teacherId ? { teacherId: params.teacherId } : {}),
        ...(params.academicYearId
          ? { academicYearId: params.academicYearId }
          : {}),
        ...(params.semesterId ? { semesterId: params.semesterId } : {}),
        deletedAt: null,
      },
      orderBy: [{ classGroup: { name: 'asc' } }, { course: { title: 'asc' } }],
      select: classGroupCourseSelect,
    });
  }

  findClassGroupCourseById(id: string) {
    return this.prisma.classGroupCourse.findUnique({
      where: { id },
      select: classGroupCourseSelect,
    });
  }

  findTeacherAssignment(params: {
    mitraId: string;
    classGroupId: string;
    courseId: string;
    teacherId: string;
    academicYearId?: string;
    semesterId?: string;
  }) {
    const { academicYearId, semesterId, ...rest } = params;

    return this.prisma.classGroupCourse.findFirst({
      where: {
        ...rest,
        ...(academicYearId ? { academicYearId } : {}),
        ...(semesterId ? { semesterId } : {}),
        status: AcademicStatus.ACTIVE,
        deletedAt: null,
      },
      select: classGroupCourseSelect,
    });
  }

  updateClassGroupCourse(id: string, data: Prisma.ClassGroupCourseUpdateInput) {
    return this.prisma.classGroupCourse.update({
      where: { id },
      data,
      select: classGroupCourseSelect,
    });
  }

  createClassGroupStudent(data: Prisma.ClassGroupStudentCreateInput) {
    return this.prisma.classGroupStudent.create({
      data,
      select: classGroupStudentSelect,
    });
  }

  findClassGroupStudents(params: {
    mitraId: string;
    classGroupId?: string;
    studentId?: string;
    academicYearId?: string;
    semesterId?: string;
  }) {
    return this.prisma.classGroupStudent.findMany({
      where: {
        mitraId: params.mitraId,
        ...(params.classGroupId ? { classGroupId: params.classGroupId } : {}),
        ...(params.studentId ? { studentId: params.studentId } : {}),
        ...(params.academicYearId
          ? { academicYearId: params.academicYearId }
          : {}),
        ...(params.semesterId ? { semesterId: params.semesterId } : {}),
        deletedAt: null,
      },
      orderBy: [{ classGroup: { name: 'asc' } }, { student: { name: 'asc' } }],
      select: classGroupStudentSelect,
    });
  }

  findClassGroupStudentById(id: string) {
    return this.prisma.classGroupStudent.findUnique({
      where: { id },
      select: classGroupStudentSelect,
    });
  }

  findActiveStudentMembership(params: {
    mitraId: string;
    classGroupId: string;
    studentId: string;
    academicYearId?: string;
    semesterId?: string;
  }) {
    const { academicYearId, semesterId, ...rest } = params;

    return this.prisma.classGroupStudent.findFirst({
      where: {
        ...rest,
        ...(academicYearId ? { academicYearId } : {}),
        ...(semesterId ? { semesterId } : {}),
        status: AcademicStatus.ACTIVE,
        deletedAt: null,
      },
      select: classGroupStudentSelect,
    });
  }

  updateClassGroupStudent(
    id: string,
    data: Prisma.ClassGroupStudentUpdateInput,
  ) {
    return this.prisma.classGroupStudent.update({
      where: { id },
      data,
      select: classGroupStudentSelect,
    });
  }

  createLearningMaterial(data: Prisma.LearningMaterialCreateInput) {
    return this.prisma.learningMaterial.create({
      data,
      select: learningMaterialSelect,
    });
  }

  findLearningMaterialById(id: string) {
    return this.prisma.learningMaterial.findUnique({
      where: { id },
      select: learningMaterialSelect,
    });
  }

  findLearningMaterials(params: {
    mitraId: string;
    classGroupId?: string;
    courseId?: string;
    teacherId?: string;
    academicYearId?: string;
    semesterId?: string;
  }) {
    const { academicYearId, semesterId, ...rest } = params;

    return this.prisma.learningMaterial.findMany({
      where: {
        ...rest,
        deletedAt: null,
        ...(academicYearId || semesterId
          ? {
              classGroup: {
                academicClass: {
                  ...(academicYearId ? { academicYearId } : {}),
                  ...(semesterId ? { semesterId } : {}),
                },
              },
            }
          : {}),
      },
      orderBy: {
        uploadedAt: 'desc',
      },
      select: learningMaterialSelect,
    });
  }

  updateLearningMaterial(id: string, data: Prisma.LearningMaterialUpdateInput) {
    return this.prisma.learningMaterial.update({
      where: { id },
      data,
      select: learningMaterialSelect,
    });
  }

  findTeacherClassGroups(params: {
    mitraId: string;
    teacherId: string;
    academicYearId?: string;
    semesterId?: string;
  }) {
    const { academicYearId, semesterId, ...rest } = params;

    return this.prisma.classGroupCourse.findMany({
      where: {
        ...rest,
        deletedAt: null,
        status: AcademicStatus.ACTIVE,
        ...(academicYearId ? { academicYearId } : {}),
        ...(semesterId ? { semesterId } : {}),
      },
      orderBy: [{ classGroup: { name: 'asc' } }, { course: { title: 'asc' } }],
      select: classGroupCourseSelect,
    });
  }

  findStudentClassGroups(params: {
    mitraId: string;
    studentId: string;
    academicYearId?: string;
    semesterId?: string;
  }) {
    const { academicYearId, semesterId, ...rest } = params;

    return this.prisma.classGroupStudent.findMany({
      where: {
        ...rest,
        deletedAt: null,
        status: AcademicStatus.ACTIVE,
        ...(academicYearId ? { academicYearId } : {}),
        ...(semesterId ? { semesterId } : {}),
      },
      orderBy: [{ classGroup: { name: 'asc' } }],
      select: classGroupStudentSelect,
    });
  }

  findTeacherSubjects(params: {
    mitraId: string;
    teacherId: string;
    academicYearId?: string;
    semesterId?: string;
  }) {
    const { academicYearId, semesterId, ...rest } = params;

    return this.prisma.course.findMany({
      where: {
        mitraId: rest.mitraId,
        scope: RoleScope.MITRA,
        deletedAt: null,
        classGroupCourses: {
          some: {
            teacherId: rest.teacherId,
            deletedAt: null,
            status: AcademicStatus.ACTIVE,
            ...(academicYearId ? { academicYearId } : {}),
            ...(semesterId ? { semesterId } : {}),
          },
        },
      },
      orderBy: {
        title: 'asc',
      },
      select: subjectSelect,
    });
  }

  findStudentSubjects(params: {
    mitraId: string;
    studentId: string;
    academicYearId?: string;
    semesterId?: string;
  }) {
    const { academicYearId, semesterId, ...rest } = params;

    return this.prisma.course.findMany({
      where: {
        mitraId: rest.mitraId,
        scope: RoleScope.MITRA,
        deletedAt: null,
        classGroupCourses: {
          some: {
            deletedAt: null,
            status: AcademicStatus.ACTIVE,
            ...(academicYearId ? { academicYearId } : {}),
            ...(semesterId ? { semesterId } : {}),
            classGroup: {
              classGroupStudents: {
                some: {
                  studentId: rest.studentId,
                  deletedAt: null,
                  status: AcademicStatus.ACTIVE,
                  ...(academicYearId ? { academicYearId } : {}),
                  ...(semesterId ? { semesterId } : {}),
                },
              },
            },
          },
        },
      },
      orderBy: {
        title: 'asc',
      },
      select: subjectSelect,
    });
  }

  findStudentAccessibleMaterials(params: {
    mitraId: string;
    studentId: string;
    classGroupId?: string;
    courseId?: string;
    academicYearId?: string;
    semesterId?: string;
  }) {
    const { academicYearId, semesterId, studentId, ...rest } = params;

    return this.prisma.learningMaterial.findMany({
      where: {
        ...rest,
        deletedAt: null,
        classGroup: {
          classGroupStudents: {
            some: {
              studentId,
              deletedAt: null,
              status: AcademicStatus.ACTIVE,
              ...(academicYearId ? { academicYearId } : {}),
              ...(semesterId ? { semesterId } : {}),
            },
          },
          academicClass: {
            ...(academicYearId ? { academicYearId } : {}),
            ...(semesterId ? { semesterId } : {}),
          },
        },
      },
      orderBy: {
        uploadedAt: 'desc',
      },
      select: learningMaterialSelect,
    });
  }
}
