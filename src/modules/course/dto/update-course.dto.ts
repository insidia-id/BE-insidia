import {
  AcademicStatus,
  CourseLevel,
  CourseStatus,
  RoleScope,
} from '@prisma/client';
import { z } from 'zod';
import { normalizeCourseSlug } from './create-course.dto';

const optionalNullableStringSchema = z.preprocess(
  (value) => (value === '' ? null : value),
  z.string().trim().min(1).nullable().optional(),
);

const optionalStringSchema = z.preprocess(
  (value) => (value === '' ? undefined : value),
  z.string().trim().min(1).optional(),
);

const optionalNullableNumberSchema = z.preprocess((value) => {
  if (value === '' || value === null || value === undefined) {
    return null;
  }

  return value;
}, z.coerce.number().min(0).nullable().optional());

const optionalBooleanSchema = z.preprocess((value) => {
  if (typeof value === 'string') {
    return value === 'true';
  }

  return value;
}, z.boolean().optional());

const stringArraySchema = z
  .array(z.string().trim().min(1))
  .transform((items) => items.map((item) => item.trim()))
  .optional();

export const updateCourseSchema = z
  .object({
    title: z.string().trim().min(1).optional(),
    code: optionalNullableStringSchema,
    slug: optionalStringSchema.transform((value) =>
      value === undefined ? undefined : normalizeCourseSlug(value),
    ),
    subtitle: optionalNullableStringSchema,
    description: optionalNullableStringSchema,
    status: z.enum(CourseStatus).optional(),
    academicStatus: z.enum(AcademicStatus).optional(),
    level: z.enum(CourseLevel).optional(),
    categoryId: optionalNullableStringSchema,
    language: z.string().trim().min(1).optional(),
    price: z.coerce.number().min(0).optional(),
    salePrice: optionalNullableNumberSchema,
    isFree: optionalBooleanSchema,
    requirements: stringArraySchema,
    outcomes: stringArraySchema,
    targetUsers: stringArraySchema,
    rejectReason: optionalNullableStringSchema,
    scope: z.enum(RoleScope, 'ruang lingkup permission tidak valid'),
    curriculumId: optionalStringSchema,
  })
  .superRefine((value, ctx) => {
    if (
      value.price !== undefined &&
      value.salePrice !== undefined &&
      value.salePrice !== null &&
      value.salePrice > value.price
    ) {
      ctx.addIssue({
        code: 'custom',
        message: 'salePrice tidak boleh lebih besar dari price',
        path: ['salePrice'],
      });
    }

    if (value.status === 'REJECTED' && value.rejectReason === undefined) {
      ctx.addIssue({
        code: 'custom',
        message: 'alasan penolakan wajib diisi saat status REJECTED',
        path: ['rejectReason'],
      });
    }
  });

export type UpdateCourseDto = z.infer<typeof updateCourseSchema>;
