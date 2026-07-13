import {
  findMyClassGroupsSelect,
  findMyClassStudentsSelect,
  findMyCoursesStudentSelect,
  findMyCoursesTeacherSelect,
} from './my-academic.constants';
import type { Prisma } from '@prisma/client';
export type MitraAcademicTerm = {
  academicYearId?: string;
  semesterId?: string;
};

export type MyClassGroupCourse = Prisma.ClassGroupCourseGetPayload<{
  select: typeof findMyClassGroupsSelect;
}>;

export type MyClassGroupStudent = Prisma.ClassGroupStudentGetPayload<{
  select: typeof findMyClassStudentsSelect;
}>;

export type MyCourseTeacher = Prisma.CourseGetPayload<{
  select: ReturnType<typeof findMyCoursesTeacherSelect>;
}>;

export type MyCourseStudent = Prisma.CourseGetPayload<{
  select: ReturnType<typeof findMyCoursesStudentSelect>;
}>;
