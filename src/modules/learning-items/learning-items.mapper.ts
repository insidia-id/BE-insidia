import {
  LearningDetailItemRecord,
  LearningItemRecord,
} from './learning-items.constants';

function getLearningItemDomain(
  item: LearningDetailItemRecord,
): 'INSIDIA' | 'MITRA' {
  if (item.module.courseInsidia?.id && item.module.courseInsidia) {
    return 'INSIDIA';
  }
  if (item.module.classGroupCourse?.id && item.module.classGroupCourse) {
    return 'MITRA';
  }
  throw new Error('Learning item tidak memiliki domain yang valid');
}

function getLearningItemOwnerId(item: LearningDetailItemRecord): string {
  const domain = getLearningItemDomain(item);

  if (domain === 'INSIDIA' && item.module.courseInsidia) {
    return item.module.courseInsidia.course.creatorId;
  }
  if (domain === 'MITRA' && item.module.classGroupCourse) {
    return item.module.classGroupCourse.teacherId;
  }

  throw new Error('Tidak dapat menemukan owner ID dari learning item');
}

export function serializeLearningItem(
  item: LearningItemRecord,
  options?: { locked: boolean },
) {
  return {
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
    lessonsId: item.lesson?.id,
    quizId: item.quiz?.id,
    assignmentId: item.assignment?.id,
    ...(options?.locked !== undefined ? { locked: options.locked } : {}),
  };
}
export type serializeLearningItem = ReturnType<typeof serializeLearningItem>;
export { getLearningItemDomain, getLearningItemOwnerId };
