import { BadRequestException } from '@nestjs/common';
import { Prisma, RoleScope } from '@prisma/client';
import type { CreateCourseModuleDto } from './dto/create-course-module.dto';
import type { UpdateCourseModuleDto } from './dto/update-course-module.dto';
import { courseModuleSelect } from './course-modules.repository';

type CourseModuleRecord = Prisma.ModuleGetPayload<{
  select: typeof courseModuleSelect;
}>;

export type ModuleDomainContext =
  | { domain: 'INSIDIA'; courseInsidiaId: string }
  | { domain: 'MITRA'; classGroupCourseId: string };

/**
 * Validates that exactly one domain ownership is provided
 * Enforces business rule: Module must belong to exactly ONE domain
 */
export function validateModuleDomainOwnership(
  courseInsidiaId?: string | null,
  classGroupCourseId?: string | null,
): void {
  const hasInsidiaId = !!courseInsidiaId;
  const hasMitraId = !!classGroupCourseId;

  if (!hasInsidiaId && !hasMitraId) {
    throw new BadRequestException(
      'Module harus memiliki courseInsidiaId ATAU classGroupCourseId',
    );
  }

  if (hasInsidiaId && hasMitraId) {
    throw new BadRequestException(
      'Module tidak boleh memiliki courseInsidiaId DAN classGroupCourseId secara bersamaan',
    );
  }
}

export function mapCreateCourseModuleData(
  domainContext: ModuleDomainContext,
  input: CreateCourseModuleDto,
): Prisma.ModuleUncheckedCreateInput {
  const baseData = {
    title: input.title.trim(),
    summary: input.summary ?? null,
    sortOrder: input.sortOrder,
  };

  if (domainContext.domain === 'INSIDIA') {
    return {
      ...baseData,
      courseInsidiaId: domainContext.courseInsidiaId,
      classGroupCourseId: null,
    };
  } else {
    return {
      ...baseData,
      classGroupCourseId: domainContext.classGroupCourseId,
      courseInsidiaId: null,
    };
  }
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
  // Validate business rule
  validateModuleDomainOwnership(
    module.courseInsidiaId,
    module.classGroupCourseId,
  );

  const baseModule = {
    id: module.id,
    title: module.title,
    summary: module.summary,
    sortOrder: module.sortOrder,
    createdAt: module.createdAt,
    updatedAt: module.updatedAt,
    mediaCount: module._count.media,
    learningItemsCount: module._count.learningItems,
  };

  // INSIDIA domain
  if (module.courseInsidiaId && module.courseInsidia) {
    return {
      ...baseModule,
      domain: 'INSIDIA' as RoleScope,
      courseInsidiaId: module.courseInsidiaId,
      courseInsidia: {
        id: module.courseInsidia.id,
        course: {
          id: module.courseInsidia.course.id,
          title: module.courseInsidia.course.title,
          creatorId: module.courseInsidia.course.creatorId,
          scope: module.courseInsidia.course.scope,
        },
      },
    };
  }

  // MITRA domain
  if (module.classGroupCourseId && module.classGroupCourse) {
    return {
      ...baseModule,
      domain: 'MITRA' as RoleScope,
      classGroupCourseId: module.classGroupCourseId,
      classGroupCourse: {
        id: module.classGroupCourse.id,
        teacherId: module.classGroupCourse.teacherId,
        courseMitra: module.classGroupCourse.courseMitra
          ? {
              course: {
                id: module.classGroupCourse.courseMitra.course.id,
                title: module.classGroupCourse.courseMitra.course.title,
                scope: module.classGroupCourse.courseMitra.course.scope,
              },
            }
          : null,
      },
    };
  }

  // Should never reach here due to validation
  throw new BadRequestException('Module tidak memiliki domain yang valid');
}

/**
 * Helper to determine module's domain from the record
 */
export function getModuleDomain(
  module: CourseModuleRecord,
): 'INSIDIA' | 'MITRA' {
  if (module.courseInsidiaId) return 'INSIDIA';
  if (module.classGroupCourseId) return 'MITRA';
  throw new BadRequestException('Module tidak memiliki domain yang valid');
}

/**
 * Helper to get course ID from module based on domain
 */
export function getCourseIdFromModule(module: CourseModuleRecord): string {
  if (module.courseInsidiaId && module.courseInsidia) {
    return module.courseInsidia.course.id;
  }
  if (
    module.classGroupCourseId &&
    module.classGroupCourse?.courseMitra?.course
  ) {
    return module.classGroupCourse.courseMitra.course.id;
  }
  throw new BadRequestException('Tidak dapat menemukan course ID dari module');
}

/**
 * Helper to get creator/owner ID from module based on domain
 */
export function getModuleOwnerId(module: CourseModuleRecord): string {
  if (module.courseInsidiaId && module.courseInsidia) {
    return module.courseInsidia.course.creatorId;
  }
  if (module.classGroupCourseId && module.classGroupCourse) {
    return module.classGroupCourse.teacherId;
  }
  throw new BadRequestException('Tidak dapat menemukan owner ID dari module');
}
