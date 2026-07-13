import type {
  MyClassGroupCourse,
  MyClassGroupStudent,
  MyCourseStudent,
  MyCourseTeacher,
} from './my-academic.types';

export function serializeMyClassesGroupsCourse(record: MyClassGroupCourse) {
  return {
    id: record.id,
    mitraId: record.mitraId,
    classGroupId: record.classGroupId,
    teacherId: record.teacherId,
    academicYearId: record.academicYearId,
    semesterId: record.semesterId,
    status: record.status,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    courseMitraid: record.courseMitra?.id,
    teacher: {
      id: record.teacher.id,
      name: record.teacher.name,
      email: record.teacher.email,
    },
    course: {
      id: record.courseMitra?.course?.id,
      title: record.courseMitra?.course?.title,
    },
    classGroup: {
      id: record.classGroup.id,
      name: record.classGroup.name,
    },
    academicClass: {
      id: record.classGroup.academicClass.id,
      name: record.classGroup.academicClass.name,
    },
    academicYear: {
      id: record.academicYear.id,
      name: record.academicYear.name,
    },
    semester: {
      id: record.semester.id,
      name: record.semester.name,
    },
  };
}

export function serializeMyClassesGroupsStudent(record: MyClassGroupStudent) {
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
    classGroup: {
      id: record.classGroup.id,
      name: record.classGroup.name,
    },
    academicClass: {
      id: record.classGroup.academicClass.id,
      name: record.classGroup.academicClass.name,
    },
    academicYear: {
      id: record.academicYear.id,
      name: record.academicYear.name,
    },
    semester: {
      id: record.semester.id,
      name: record.semester.name,
    },
  };
}

export function serializeMyCourseTeacher(record: MyCourseTeacher) {
  return {
    id: record.id,
    title: record.title,
    subtitle: record.subtitle,
    slug: record.slug,
    createdAt: record.createdAt,
    description: record.description,
    updatedAt: record.updatedAt,
    scope: record.scope,
    mitraId: record.mitra?.mitraId,
    mitraName: record.mitra?.mitra?.name,
    curriculumId: record.mitra?.curriculumId,
    totalClassGroupCourses: record.mitra?.classGroupCourses.length || 0,
    classGroupCourses: record.mitra?.classGroupCourses.map((item) => ({
      classGroupCourseId: item.id,
      classGroupName: item.classGroup.name,
      academicYearId: item.academicYearId,
      semesterId: item.semesterId,
    })),
    totalModules: record.mitra?.classGroupCourses.reduce(
      (total, classGroupCourse) => total + classGroupCourse._count.modules,
      0,
    ),
    totalLearningItems: record.mitra?.classGroupCourses.reduce(
      (total, classGroupCourse) =>
        total +
        classGroupCourse.modules.reduce(
          (moduleTotal, module) => moduleTotal + module._count.learningItems,
          0,
        ),
      0,
    ),
    curriculum: record.mitra?.curriculum?.name,
    teacher: record.mitra?.classGroupCourses[0]?.teacher,
  };
}

export function serializeMyCourseStudent(record: MyCourseStudent) {
  return {
    id: record.id,
    title: record.title,
    subtitle: record.subtitle,
    slug: record.slug,
    scope: record.scope,
    description: record.description,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    mitraId: record.mitra?.mitraId,
    mitraName: record.mitra?.mitra?.name,
    curriculumId: record.mitra?.curriculumId,
    curriculum: record.mitra?.curriculum?.name,
    totalClassGroupCourses: record.mitra?.classGroupCourses.length || 0,
    teacher: record.mitra?.classGroupCourses[0]?.teacher ?? null,
    classGroupCourses: record.mitra?.classGroupCourses.map((item) => ({
      classGroupCourseId: item.id,
      teacherId: item.teacherId,
      academicYearId: item.academicYearId,
      semesterId: item.semesterId,
    })),
    totalModules: record.mitra?.classGroupCourses.reduce(
      (total, classGroupCourse) => total + classGroupCourse._count.modules,
      0,
    ),
    totalLearningItems: record.mitra?.classGroupCourses.reduce(
      (total, classGroupCourse) =>
        total +
        classGroupCourse.modules.reduce(
          (moduleTotal, module) => moduleTotal + module._count.learningItems,
          0,
        ),
      0,
    ),
  };
}
