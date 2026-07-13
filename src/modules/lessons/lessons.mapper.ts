import { Prisma } from '@prisma/client';
import type { CreateLessonDto } from './dto/create-lesson.dto';
import type { UpdateLessonDto } from './dto/update-lesson.dto';
import type { LessonSelect } from './lessons.constants';
import { serializeLearningItem } from '../learning-items/learning-items.mapper';

export function mapCreateLessonData(data: CreateLessonDto) {
  return {
    learningItem: {
      title: data.title,
      slug: data.slug,
      description: data.description,
      order: data.order,
      availableFrom: data.availableFrom,
      availableUntil: data.availableUntil,
      published: data.published,
      isPreview: data.isPreview,
      type: 'LESSON' as const,
    },

    lesson: {
      type: data.typeLesson,
      contentJson: data.contentJson,
      contentHtml: data.contentHtml,
    },
  };
}
export type MapCreateLessonData = ReturnType<typeof mapCreateLessonData>;

type UpdateLessonData = {
  learningItem: Prisma.LearningItemUpdateInput;
  lesson: Prisma.LessonUpdateInput;
};

export function mapUpdateLessonData(input: UpdateLessonDto): UpdateLessonData {
  return {
    learningItem: {
      ...(input.title !== undefined && { title: input.title.trim() }),
      ...(input.slug !== undefined && { slug: input.slug.trim() }),
      ...(input.description !== undefined && {
        description: input.description?.trim(),
      }),
      ...(input.order !== undefined && { order: input.order }),
      ...(input.published !== undefined && {
        published: input.published,
      }),
      ...(input.isPreview !== undefined && {
        isPreview: input.isPreview,
      }),
      ...(input.type !== undefined && {
        type: input.type,
      }),
    },

    lesson: {
      ...(input.typeLesson !== undefined && {
        type: input.typeLesson,
      }),
      ...(input.contentJson !== undefined && {
        contentJson: input.contentJson,
      }),
      ...(input.contentHtml !== undefined && {
        contentHtml: input.contentHtml,
      }),
    },
  };
}

export type MapUpdateLessonData = ReturnType<typeof mapUpdateLessonData>;

export function serializeLesson(
  learningitem: serializeLearningItem,
  lesson: LessonSelect,
) {
  return {
    id: lesson.learningItemId,
    lessonsId: learningitem.lessonsId,
    typeLesson: lesson.type,
    contentJson: lesson.contentJson,
    contentHtml: lesson.contentHtml,
    moduleId: learningitem.moduleId,
    type: learningitem.type,
    title: learningitem.title,
    order: learningitem.order,
    published: learningitem.published,
    availableFrom: learningitem.availableFrom,
    availableUntil: learningitem.availableUntil,
    createdAt: learningitem.createdAt,
    updatedAt: learningitem.updatedAt,
    locked: learningitem.locked,
  };
}
