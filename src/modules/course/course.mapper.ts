import { RoleScope } from '@prisma/client';
import {
  CreateCourseDto,
  CreateCourseInsidiaDto,
  CreateCourseMitraDto,
  normalizeCourseSlug,
} from './dto/create-course.dto';
import {
  UpdateCourseDto,
  UpdateCourseInsidiaDto,
  UpdateCourseMitraDto,
} from './dto/update-course.dto';
import { Prisma } from '@prisma/client';
import {
  CourseInsidiaDetailSelect,
  CourseInsidiaListSelect,
  CourseMitraDetailSelect,
  CourseMitraListSelect,
} from './course.constants';

export function normalizeSlugPart(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .replace(/[_\s]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function decimalToNumber(val: any): number {
  if (val && typeof val.toNumber === 'function') {
    return val.toNumber();
  }
  return Number(val) || 0;
}

function decimalToNullableNumber(val: any): number | null {
  if (val === null || val === undefined) return null;
  if (val && typeof val.toNumber === 'function') {
    return val.toNumber();
  }
  return Number(val) || null;
}

export function buildCreateCoursePayload(
  creatorId: string,
  input: CreateCourseDto,
  options?: { slug?: string },
) {
  const payload: Prisma.CourseCreateInput = {
    creator: {
      connect: {
        id: creatorId,
      },
    },
    title: input.title.trim(),
    slug: options?.slug ?? input.slug ?? normalizeCourseSlug(input.title),
    code: input.code,
    subtitle: input.subtitle ?? null,
    description: input.description ?? null,
    scope: input.scope,
  };

  return payload;
}

export function buildCreateCourseMitraPayload(input: CreateCourseMitraDto) {
  return {
    create: {
      mitraId: input.mitraId,
      curriculumId: input.curriculumId,
      academicStatus: input.academicStatus ?? 'ACTIVE',
    },
  };
}

export function buildCreateCourseMitra(
  creatorId: string,
  input: CreateCourseMitraDto,
  options?: { slug?: string },
): Prisma.CourseCreateInput {
  const payload = buildCreateCoursePayload(creatorId, input, options);

  payload.mitra = buildCreateCourseMitraPayload(input);

  return payload;
}

export function buildCreateCourseInsidiaPayload(input: CreateCourseInsidiaDto) {
  let pricing = {
    price: input.price,
    salePrice: input.salePrice,
  };

  if (input.isFree) {
    pricing = {
      price: 0,
      salePrice: null,
    };
  } else {
    pricing.salePrice = input.salePrice ?? null;
  }
  return {
    create: {
      level: input.level,
      price: pricing.price,
      salePrice: pricing.salePrice,
      isFree: input.isFree,
      requirements: input.requirements,
      outcomes: input.outcomes,
      targetUsers: input.targetUsers,
    },
  };
}

export function buildCreateCourseInsidia(
  creatorId: string,
  input: CreateCourseInsidiaDto,
  options?: { slug?: string },
): Prisma.CourseCreateInput {
  const payload = buildCreateCoursePayload(creatorId, input, options);

  payload.insidia = buildCreateCourseInsidiaPayload(input);

  return payload;
}

export function buildUpdateCoursePayload(
  input: UpdateCourseDto,
  options?: { slug?: string },
): Prisma.CourseUpdateInput {
  const payload: Prisma.CourseUpdateInput = {};

  if (input.title !== undefined) {
    payload.title = input.title.trim();
  }

  if (options?.slug !== undefined) {
    payload.slug = options.slug;
  } else if (input.slug !== undefined) {
    payload.slug = input.slug;
  } else if (input.title !== undefined) {
    payload.slug = normalizeCourseSlug(input.title);
  }

  if (input.code !== undefined) {
    payload.code = input.code;
  }

  if (input.subtitle !== undefined) {
    payload.subtitle = input.subtitle;
  }

  if (input.description !== undefined) {
    payload.description = input.description;
  }

  return payload;
}

export function buildUpdateCourseInsidiaPayload(
  currentCourse: CourseInsidiaDetailSelect,
  input: UpdateCourseInsidiaDto,
): Prisma.CourseInsidiaUpdateOneWithoutCourseNestedInput | undefined {
  const update: Prisma.CourseInsidiaUpdateInput = {};

  if (input.level !== undefined) {
    update.level = input.level;
  }

  if (
    input.price !== undefined ||
    input.salePrice !== undefined ||
    input.isFree !== undefined
  ) {
    const isFree = input.isFree ?? currentCourse.insidia?.isFree ?? false;

    const price = input.price ?? decimalToNumber(currentCourse.insidia?.price);

    const salePrice =
      input.salePrice ??
      decimalToNullableNumber(currentCourse.insidia?.salePrice);

    if (isFree) {
      update.price = 0;
      update.salePrice = null;
      update.isFree = true;
    } else {
      update.price = price;
      update.salePrice = salePrice;
      update.isFree = false;
    }
  }

  if (input.requirements !== undefined) {
    update.requirements =
      input.requirements ?? currentCourse.insidia?.requirements ?? [];
  }

  if (input.outcomes !== undefined) {
    update.outcomes = input.outcomes ?? currentCourse.insidia?.outcomes ?? [];
  }

  if (input.targetUsers !== undefined) {
    update.targetUsers =
      input.targetUsers ?? currentCourse.insidia?.targetUsers ?? [];
  }

  if (Object.keys(update).length === 0) {
    return undefined;
  }

  return {
    update,
  };
}

export function buildUpdateCourseInsidia(
  currentCourse: CourseInsidiaDetailSelect,
  input: UpdateCourseInsidiaDto,
  options?: { slug?: string },
): Prisma.CourseUpdateInput {
  const payload = buildUpdateCoursePayload(input, options);

  payload.insidia = buildUpdateCourseInsidiaPayload(currentCourse, input);

  return payload;
}

export function buildUpdateCourseMitraPayload(
  currentCourse: CourseMitraDetailSelect,
  input: UpdateCourseMitraDto,
): Prisma.CourseMitraUpdateOneWithoutCourseNestedInput | undefined {
  const update: Prisma.CourseMitraUpdateInput = {};

  if (input.curriculumId !== undefined) {
    update.curriculum = {
      connect: {
        id: input.curriculumId ?? currentCourse.mitra?.curriculum?.id,
      },
    };
  }

  if (input.academicStatus !== undefined) {
    update.academicStatus =
      input.academicStatus ?? currentCourse.mitra?.academicStatus;
  }

  if (Object.keys(update).length === 0) {
    return undefined;
  }

  return {
    update,
  };
}

export function buildUpdateCourseMitra(
  currentCourse: CourseMitraDetailSelect,
  input: UpdateCourseMitraDto,
  options?: { slug?: string },
): Prisma.CourseUpdateInput {
  const payload = buildUpdateCoursePayload(input, options);

  payload.mitra = buildUpdateCourseMitraPayload(currentCourse, input);

  return payload;
}

export function serializeCourseInsidiaListItem(
  course: CourseInsidiaListSelect,
) {
  return {
    id: course.id,

    title: course.title,

    slug: course.slug,

    scope: course.scope,

    createdAt: course.createdAt,

    price: decimalToNumber(course.insidia?.price),

    salePrice: decimalToNullableNumber(course.insidia?.salePrice),

    totalModules: course.insidia?._count.modules ?? 0,
  };
}

export function serializeCourseMitraListItem(course: CourseMitraListSelect) {
  return {
    id: course.id,

    title: course.title,

    slug: course.slug,

    scope: course.scope,

    createdAt: course.createdAt,

    academicStatus: course.mitra?.academicStatus,

    curriculum: course.mitra?.curriculum,

    totalMedia: course._count.media,
  };
}

export function serializeCourseInsidiaDetail(
  course: CourseInsidiaDetailSelect,
) {
  return {
    id: course.id,
    title: course.title,
    slug: course.slug,

    scope: course.scope,

    createdAt: course.createdAt,

    level: course.insidia?.level,

    price: decimalToNumber(course.insidia?.price),

    salePrice: decimalToNullableNumber(course.insidia?.salePrice),

    isFree: course.insidia?.isFree,

    requirements: course.insidia?.requirements ?? [],

    outcomes: course.insidia?.outcomes ?? [],

    targetUsers: course.insidia?.targetUsers ?? [],
  };
}

export function serializeCourseMitraDetail(course: CourseMitraDetailSelect) {
  return {
    id: course.id,

    title: course.title,

    slug: course.slug,

    scope: course.scope,

    createdAt: course.createdAt,

    academicStatus: course.mitra?.academicStatus,

    curriculum: course.mitra?.curriculum,
  };
}
