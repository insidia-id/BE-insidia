import { Prisma } from '@prisma/client';
import type { CreateLearningItemDto } from './dto/create-learning-item.dto';
import type { UpdateLearningItemDto } from './dto/update-learning-item.dto';
import { learningItemSelect } from './learning-items.repository';

type LearningItemRecord = Prisma.LearningItemGetPayload<{
  select: typeof learningItemSelect;
}>;

/**
 * Determine if a learning item belongs to INSIDIA or MITRA domain
 */
function getLearningItemDomain(item: LearningItemRecord): 'INSIDIA' | 'MITRA' {
  if (item.module.courseInsidiaId && item.module.courseInsidia) {
    return 'INSIDIA';
  }
  if (item.module.classGroupCourseId && item.module.classGroupCourse) {
    return 'MITRA';
  }
  throw new Error('Learning item tidak memiliki domain yang valid');
}

/**
 * Get the course from learning item based on its domain
 */
function getCourseFromLearningItem(item: LearningItemRecord) {
  const domain = getLearningItemDomain(item);

  if (domain === 'INSIDIA' && item.module.courseInsidia) {
    return item.module.courseInsidia.course;
  }
  if (domain === 'MITRA' && item.module.classGroupCourse?.courseMitra) {
    return item.module.classGroupCourse.courseMitra.course;
  }

  throw new Error('Tidak dapat menemukan course dari learning item');
}

/**
 * Get the owner/creator ID from learning item based on its domain
 */
function getLearningItemOwnerId(item: LearningItemRecord): string {
  const domain = getLearningItemDomain(item);

  if (domain === 'INSIDIA' && item.module.courseInsidia) {
    return item.module.courseInsidia.course.creatorId;
  }
  if (domain === 'MITRA' && item.module.classGroupCourse) {
    return item.module.classGroupCourse.teacherId;
  }

  throw new Error('Tidak dapat menemukan owner ID dari learning item');
}

export function mapCreateLearningItemData(
  moduleId: string,
  input: CreateLearningItemDto,
): Prisma.LearningItemUncheckedCreateInput {
  return {
    moduleId,
    type: input.type,
    title: input.title.trim(),
    order: input.order,
    published: input.published ?? false,
    availableFrom: input.availableFrom ?? null,
    availableUntil: input.availableUntil ?? null,
  };
}

export function mapUpdateLearningItemData(
  input: UpdateLearningItemDto,
): Prisma.LearningItemUpdateInput {
  return {
    ...(input.type !== undefined ? { type: input.type } : {}),
    ...(input.title !== undefined ? { title: input.title.trim() } : {}),
    ...(input.order !== undefined ? { order: input.order } : {}),
    ...(input.published !== undefined ? { published: input.published } : {}),
    ...(input.availableFrom !== undefined
      ? { availableFrom: input.availableFrom }
      : {}),
    ...(input.availableUntil !== undefined
      ? { availableUntil: input.availableUntil }
      : {}),
  };
}

export function serializeLearningItem(item: LearningItemRecord) {
  const domain = getLearningItemDomain(item);
  const course = getCourseFromLearningItem(item);

  const baseItem = {
    id: item.id,
    moduleId: item.moduleId,
    type: item.type,
    title: item.title,
    order: item.order,
    published: item.published,
    availableFrom: item.availableFrom,
    availableUntil: item.availableUntil,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    domain,
    module: {
      id: item.module.id,
      title: item.module.title,
      summary: item.module.summary,
      sortOrder: item.module.sortOrder,
    },
    course: {
      id: course.id,
      title: course.title,
      scope: course.scope,
    },
    lesson: item.lesson,
    quiz: item.quiz,
    assignment: item.assignment,
  };

  // Add domain-specific metadata
  if (domain === 'INSIDIA' && item.module.courseInsidia) {
    return {
      ...baseItem,
      courseInsidiaId: item.module.courseInsidiaId,
      courseInsidia: {
        id: item.module.courseInsidia.id,
      },
      creatorId: item.module.courseInsidia.course.creatorId,
    };
  }

  if (domain === 'MITRA' && item.module.classGroupCourse) {
    return {
      ...baseItem,
      classGroupCourseId: item.module.classGroupCourseId,
      classGroupCourse: {
        id: item.module.classGroupCourse.id,
        teacherId: item.module.classGroupCourse.teacherId,
      },
      creatorId: item.module.classGroupCourse.teacherId,
    };
  }

  return baseItem;
}

// Export helper functions for use in service and policy
export {
  getLearningItemDomain,
  getCourseFromLearningItem,
  getLearningItemOwnerId,
};
