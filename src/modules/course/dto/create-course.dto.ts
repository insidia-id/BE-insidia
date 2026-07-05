import { AcademicStatus, CourseLevel, RoleScope } from '@prisma/client';
import { z } from 'zod';
import {
  optionalBooleanSchema,
  optionalNullableNumberSchema,
  optionalNullableStringSchema,
  optionalStringSchema,
  stringArraySchema,
} from '../../../shared/zod/zod.schemas';

export function normalizeCourseSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .replace(/[_\s]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export const CourseBaseSchema = z.object({
  title: z.string().trim().min(1, 'judul course wajib diisi'),
  code: optionalNullableStringSchema,
  slug: optionalStringSchema.transform((value) =>
    value === undefined ? undefined : normalizeCourseSlug(value),
  ),
  subtitle: optionalNullableStringSchema,
  description: optionalNullableStringSchema,
});

export const createCourseInsidiaSchema = CourseBaseSchema.extend({
  scope: z.literal(RoleScope.INSIDIA),

  level: z.enum(CourseLevel).default('ALL_LEVEL'),

  price: z.coerce.number().min(0).default(0),

  salePrice: optionalNullableNumberSchema,

  isFree: optionalBooleanSchema.default(false),

  requirements: stringArraySchema,

  outcomes: stringArraySchema,

  targetUsers: stringArraySchema,
}).superRefine((value, ctx) => {
  if (
    !value.isFree &&
    value.salePrice != null &&
    value.salePrice > value.price
  ) {
    ctx.addIssue({
      code: 'custom',
      path: ['salePrice'],
      message: 'salePrice tidak boleh lebih besar dari price',
    });
  }
});

export const createCourseMitraSchema = CourseBaseSchema.extend({
  scope: z.literal(RoleScope.MITRA),

  mitraId: z.string(),

  curriculumId: z.string(),

  academicStatus: z.enum(AcademicStatus).default('ACTIVE'),
});
export const createCourseSchema = z.discriminatedUnion('scope', [
  createCourseInsidiaSchema,
  createCourseMitraSchema,
]);
export type CreateCourseDto = z.infer<typeof createCourseSchema>;
export type CreateCourseMitraDto = z.infer<typeof createCourseMitraSchema>;
export type CreateCourseInsidiaDto = z.infer<typeof createCourseInsidiaSchema>;
