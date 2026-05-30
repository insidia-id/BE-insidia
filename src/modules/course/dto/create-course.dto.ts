import {
  AcademicStatus,
  CourseLevel,
  CourseStatus,
  RoleScope,
} from '@prisma/client';
import { z } from 'zod';

const optionalNullableStringSchema = z.preprocess(
  (value) => (value === '' ? null : value),
  z.string().trim().min(1).nullable().optional(),
);

const optionalStringSchema = z.preprocess(
  (value) => (value === '' ? undefined : value),
  z.string().trim().min(1).optional(),
);

const optionalBooleanSchema = z.preprocess((value) => {
  if (typeof value === 'string') {
    return value === 'true';
  }

  return value;
}, z.boolean().optional());

const optionalNullableNumberSchema = z.preprocess((value) => {
  if (value === '' || value === null || value === undefined) {
    return null;
  }

  return value;
}, z.coerce.number().min(0).nullable().optional());

const stringArraySchema = z
  .array(z.string().trim().min(1))
  .default([])
  .transform((items) => items.map((item) => item.trim()));

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

export const createCourseSchema = z
  .object({
    title: z.string().trim().min(1, 'judul course wajib diisi'),
    code: optionalNullableStringSchema,
    slug: optionalStringSchema.transform((value) =>
      value === undefined ? undefined : normalizeCourseSlug(value),
    ),
    subtitle: optionalNullableStringSchema,
    description: optionalNullableStringSchema,
    status: z.enum(CourseStatus).optional().default('DRAFT'),
    level: z.enum(CourseLevel).optional().default('ALL_LEVEL'),
    categoryId: optionalNullableStringSchema,
    language: z.string().trim().min(1).optional().default('id'),
    price: z.coerce.number().min(0).optional().default(0),
    salePrice: optionalNullableNumberSchema,
    isFree: optionalBooleanSchema.default(false),
    requirements: stringArraySchema,
    outcomes: stringArraySchema,
    targetUsers: stringArraySchema,
    rejectReason: optionalNullableStringSchema,
    scope: z.enum(RoleScope, 'ruang lingkup permission tidak valid'),
    mitraId: optionalStringSchema,
    curriculumId: optionalStringSchema,
    academicStatus: z.enum(AcademicStatus).optional().default('ACTIVE'),
  })
  .superRefine((value, ctx) => {
    if (
      !value.isFree &&
      value.salePrice !== null &&
      value.salePrice !== undefined
    ) {
      if (value.salePrice > value.price) {
        ctx.addIssue({
          code: 'custom',
          message: 'salePrice tidak boleh lebih besar dari price',
          path: ['salePrice'],
        });
      }
    }

    if (value.status === 'REJECTED' && !value.rejectReason) {
      ctx.addIssue({
        code: 'custom',
        message: 'alasan penolakan wajib diisi saat status REJECTED',
        path: ['rejectReason'],
      });
    }

    if (value.scope === 'MITRA') {
      if (!value.mitraId) {
        ctx.addIssue({
          code: 'custom',
          message: 'mitraId wajib diisi untuk course scope MITRA',
          path: ['mitraId'],
        });
      }

      if (!value.curriculumId) {
        ctx.addIssue({
          code: 'custom',
          message: 'curriculumId wajib diisi untuk course scope MITRA',
          path: ['curriculumId'],
        });
      }

      if (!value.code) {
        ctx.addIssue({
          code: 'custom',
          message: 'kode mapel wajib diisi untuk course scope MITRA',
          path: ['code'],
        });
      }
    }
  });

export type CreateCourseDto = z.infer<typeof createCourseSchema>;
