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
    classGroup: {
      id: record.classGroup.id,
      name: record.classGroup.name,
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
    classGroup: {
      id: record.classGroup.id,
      name: record.classGroup.name,
    },
  };
}

export function serializeMyCourseTeacher(record: MyCourseTeacher) {
  return {
    id: record.id,
    title: record.title,
    subtitle: record.subtitle,
    mitra: record.mitra
      ? {
          mitraId: record.mitra.mitraId,
          curriculumId: record.mitra.curriculumId,
          classGroupCourses: record.mitra.classGroupCourses.map((item) => ({
            teacherId: item.teacherId,
            academicYearId: item.academicYearId,
            semesterId: item.semesterId,
          })),
        }
      : null,
  };
}
export function serializeMyCourseStudent(record: MyCourseStudent) {
  return {
    id: record.id,
    title: record.title,
    subtitle: record.subtitle,
    mitra: record.mitra
      ? {
          mitraId: record.mitra.mitraId,
          curriculumId: record.mitra.curriculumId,
          classGroupCourses: record.mitra.classGroupCourses.map((item) => ({
            teacherId: item.teacherId,
            teacher: item.teacher
              ? {
                  id: item.teacher.id,
                  name: item.teacher.name,
                }
              : null,
            academicYearId: item.academicYearId,
            semesterId: item.semesterId,
            students: item.mitra.classGroupStudents.map((student) => ({
              studentId: student.studentId,
            })),
          })),
        }
      : null,
  };
}
