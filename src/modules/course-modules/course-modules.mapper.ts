import { Prisma } from '@prisma/client';
import type { CreateCourseModuleDto } from './dto/create-course-module.dto';
import type { UpdateCourseModuleDto } from './dto/update-course-module.dto';
import { courseModuleSelect } from './course-modules.repository';

type CourseModuleRecord = Prisma.ModuleGetPayload<{
  select: typeof courseModuleSelect;
}>;

export function mapCreateCourseModuleData(
  courseId: string,
  input: CreateCourseModuleDto,
): Prisma.ModuleUncheckedCreateInput {
  return {
    courseId,
    title: input.title.trim(),
    summary: input.summary ?? null,
    sortOrder: input.sortOrder,
  };
}

export function mapUpdateCourseModuleData(
  input: UpdateCourseModuleDto,
): Prisma.ModuleUpdateInput {
  return {
    ...(input.title !== undefined ? { title: input.title.trim() } : {}),
    ...(input.summary !== undefined ? { summary: input.summary } : {}),
    ...(input.sortOrder !== undefined ? { sortOrder: input.sortOrder } : {}),
  };
}

export function serializeCourseModule(module: CourseModuleRecord) {
  return {
    ...module,
    course: {
      id: module.course.id,
      title: module.course.title,
      creatorId: module.course.creatorId,
    },
  };
}
