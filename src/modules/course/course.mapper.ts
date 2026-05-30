import { BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  normalizeCourseSlug,
  type CreateCourseDto,
} from './dto/create-course.dto';
import type { UpdateCourseDto } from './dto/update-course.dto';
import {
  courseAccessSelect,
  courseDetailSelect,
  courseListSelect,
} from './course.repository';

type CourseListRecord = Prisma.CourseGetPayload<{
  select: typeof courseListSelect;
}>;

type CourseDetailRecord = Prisma.CourseGetPayload<{
  select: typeof courseDetailSelect;
}>;

type CourseAccessRecord = Prisma.CourseGetPayload<{
  select: typeof courseAccessSelect;
}>;

function decimalToNumber(value: Prisma.Decimal | number) {
  return Number(value);
}

function decimalToNullableNumber(value: Prisma.Decimal | number | null) {
  return value === null ? null : Number(value);
}

function buildCategoryRelation(categoryId: string | null | undefined) {
  if (categoryId === undefined) {
    return undefined;
  }

  if (categoryId === null) {
    return {
      disconnect: true,
    };
  }

  return {
    connect: {
      id: categoryId,
    },
  };
}

function buildCurriculumRelation(curriculumId: string | null | undefined) {
  if (curriculumId === undefined) {
    return undefined;
  }

  if (curriculumId === null) {
    return {
      disconnect: true,
    };
  }

  return {
    connect: {
      id: curriculumId,
    },
  };
}

function validatePricing({
  isFree,
  price,
  salePrice,
}: {
  isFree: boolean;
  price: number;
  salePrice: number | null;
}) {
  if (isFree) {
    return {
      price: 0,
      salePrice: null,
    };
  }

  if (salePrice !== null && salePrice > price) {
    throw new BadRequestException(
      'Harga promo tidak boleh lebih besar dari harga normal',
    );
  }

  return {
    price,
    salePrice,
  };
}

export function mapCreateCourseData(
  input: CreateCourseDto,
  creatorId: string,
  options?: {
    slug?: string;
  },
): Prisma.CourseCreateInput {
  const pricing = validatePricing({
    isFree: input.isFree,
    price: input.price,
    salePrice: input.salePrice ?? null,
  });

  return {
    title: input.title.trim(),
    slug: options?.slug ?? input.slug ?? normalizeCourseSlug(input.title),
    code: input.code ?? null,
    subtitle: input.subtitle ?? null,
    description: input.description ?? null,
    status: input.status,
    academicStatus: input.academicStatus,
    level: input.level,
    language: input.language.trim(),
    price: pricing.price,
    salePrice: pricing.salePrice,
    isFree: input.isFree,
    requirements: input.requirements,
    outcomes: input.outcomes,
    targetUsers: input.targetUsers,
    publishedAt: input.status === 'PUBLISHED' ? new Date() : null,
    rejectedAt: input.status === 'REJECTED' ? new Date() : null,
    rejectReason:
      input.status === 'REJECTED' ? (input.rejectReason ?? null) : null,
    creator: {
      connect: {
        id: creatorId,
      },
    },
    scope: input.scope,
    ...(input.mitraId
      ? {
          mitra: {
            connect: {
              id: input.mitraId,
            },
          },
        }
      : {}),
    ...(input.curriculumId
      ? {
          curriculum: {
            connect: {
              id: input.curriculumId,
            },
          },
        }
      : {}),
    ...(input.categoryId
      ? {
          category: {
            connect: {
              id: input.categoryId,
            },
          },
        }
      : {}),
  };
}

export function mapUpdateCourseData(
  input: UpdateCourseDto,
  currentCourse: CourseAccessRecord,
  options?: {
    slug?: string;
  },
): Prisma.CourseUpdateInput {
  const nextIsFree = input.isFree ?? currentCourse.isFree;
  const nextPrice = input.price ?? decimalToNumber(currentCourse.price);
  const nextSalePrice =
    input.salePrice === undefined
      ? decimalToNullableNumber(currentCourse.salePrice)
      : input.salePrice;

  const pricing = validatePricing({
    isFree: nextIsFree,
    price: nextPrice,
    salePrice: nextSalePrice,
  });

  const nextStatus = input.status ?? currentCourse.status;

  if (
    nextStatus === 'REJECTED' &&
    !(input.rejectReason ?? currentCourse.rejectReason)
  ) {
    throw new BadRequestException(
      'Alasan penolakan wajib diisi saat status course REJECTED',
    );
  }

  return {
    ...(input.title !== undefined ? { title: input.title.trim() } : {}),
    ...(options?.slug !== undefined
      ? { slug: options.slug }
      : input.slug !== undefined
        ? { slug: input.slug }
        : {}),
    ...(input.code !== undefined ? { code: input.code } : {}),
    ...(input.subtitle !== undefined ? { subtitle: input.subtitle } : {}),
    ...(input.description !== undefined
      ? { description: input.description }
      : {}),
    ...(input.status !== undefined ? { status: input.status } : {}),
    ...(input.academicStatus !== undefined
      ? { academicStatus: input.academicStatus }
      : {}),
    ...(input.scope !== undefined ? { scope: input.scope } : {}),
    ...(input.level !== undefined ? { level: input.level } : {}),
    ...(input.language !== undefined
      ? { language: input.language.trim() }
      : {}),
    ...(input.isFree !== undefined ? { isFree: nextIsFree } : {}),
    ...(input.price !== undefined || input.isFree !== undefined
      ? { price: pricing.price }
      : {}),
    ...(input.salePrice !== undefined || input.isFree !== undefined
      ? { salePrice: pricing.salePrice }
      : {}),
    ...(input.requirements !== undefined
      ? { requirements: input.requirements }
      : {}),
    ...(input.outcomes !== undefined ? { outcomes: input.outcomes } : {}),
    ...(input.targetUsers !== undefined
      ? { targetUsers: input.targetUsers }
      : {}),
    ...(input.categoryId !== undefined
      ? {
          category: buildCategoryRelation(input.categoryId),
        }
      : {}),
    ...(input.curriculumId !== undefined
      ? {
          curriculum: buildCurriculumRelation(input.curriculumId),
        }
      : {}),
    ...(nextStatus === 'PUBLISHED' && currentCourse.status !== 'PUBLISHED'
      ? {
          publishedAt: new Date(),
          rejectedAt: null,
          rejectReason: null,
        }
      : {}),
    ...(nextStatus === 'REJECTED'
      ? {
          rejectedAt:
            currentCourse.status === 'REJECTED' && currentCourse.rejectedAt
              ? currentCourse.rejectedAt
              : new Date(),
          rejectReason: input.rejectReason ?? currentCourse.rejectReason,
        }
      : {}),
    ...(input.status !== undefined &&
    nextStatus !== 'REJECTED' &&
    currentCourse.status === 'REJECTED'
      ? {
          rejectedAt: null,
          rejectReason: null,
        }
      : {}),
  };
}

export function serializeCourseListItem(course: CourseListRecord) {
  return {
    ...course,
    price: decimalToNumber(course.price),
    salePrice: decimalToNullableNumber(course.salePrice),
  };
}

export function serializeCourseDetail(course: CourseDetailRecord) {
  return {
    ...serializeCourseListItem(course),
    modules: course.modules.map((module) => ({
      ...module,
    })),
  };
}
