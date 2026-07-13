import { classGroupCourseListSelect } from './class-group-course.constants';
import type { Prisma } from '@prisma/client';
export type ClassGroupListCourse = Prisma.ClassGroupCourseGetPayload<{
  select: typeof classGroupCourseListSelect;
}>;
