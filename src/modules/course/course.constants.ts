import { Prisma, RoleScope } from '@prisma/client';

export const coursePermissionCodes = {
  create: 'course.create.insidia',
  view: 'course.view.insidia',
  update: 'course.update.insidia',
  remove: 'course.remove.insidia',

  createMitra: 'course.create.mitra',
  viewMitra: 'course.view.mitra',
  updateMitra: 'course.update.mitra',
  removeMitra: 'course.remove.mitra',
} as const;

export const courseSelect = Prisma.validator<Prisma.CourseSelect>()({
  id: true,
  title: true,
  subtitle: true,
  description: true,
  creatorId: true,
  slug: true,
  code: true,
  scope: true,
  createdAt: true,
});

export const courseInsidiaListSelect = Prisma.validator<Prisma.CourseSelect>()({
  ...courseSelect,
  insidia: {
    select: {
      price: true,
      salePrice: true,
      isFree: true,
      _count: {
        select: {
          modules: true,
        },
      },
    },
  },
});

export const courseMitraListSelect = Prisma.validator<Prisma.CourseSelect>()({
  ...courseSelect,
  mitra: {
    select: {
      id: true,
      mitraId: true,
      academicStatus: true,
      curriculum: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  },

  _count: {
    select: {
      media: true,
    },
  },
});

export const courseInsidiaDetailSelect =
  Prisma.validator<Prisma.CourseSelect>()({
    ...courseSelect,
    insidia: {
      select: {
        level: true,
        price: true,
        salePrice: true,
        isFree: true,
        requirements: true,
        outcomes: true,
        targetUsers: true,
      },
    },
  });

export const courseMitraDetailSelect = Prisma.validator<Prisma.CourseSelect>()({
  ...courseSelect,
  mitra: {
    select: {
      id: true,
      mitraId: true,
      academicStatus: true,
      curriculum: {
        select: {
          id: true,
          name: true,
        },
      },
      classGroupCourses: {
        select: {
          _count: {
            select: {
              modules: true,
            },
          },
          modules: {
            select: {
              _count: {
                select: {
                  learningItems: true,
                },
              },
            },
          },
        },
      },
    },
  },
});

export const courseAccessSelect = {
  id: true,
  creatorId: true,
  scope: true,
  deletedAt: true,
} satisfies Prisma.CourseSelect;

export type CourseInsidiaListSelect = Prisma.CourseGetPayload<{
  select: typeof courseInsidiaListSelect;
}>;

export type CourseMitraListSelect = Prisma.CourseGetPayload<{
  select: typeof courseMitraListSelect;
}>;

export type CourseInsidiaDetailSelect = Prisma.CourseGetPayload<{
  select: typeof courseInsidiaDetailSelect;
}>;

export type CourseMitraDetailSelect = Prisma.CourseGetPayload<{
  select: typeof courseMitraDetailSelect;
}>;

export const selectCourseDetailByScope = (scope: RoleScope) => {
  let select: Prisma.CourseSelect;
  switch (scope) {
    case RoleScope.INSIDIA:
      return (select = courseInsidiaDetailSelect);

    case RoleScope.MITRA:
      return (select = courseMitraDetailSelect);

    default:
      return (select = courseInsidiaDetailSelect);
  }
};

export const selectCourseListByScope = (scope: RoleScope) => {
  let select: Prisma.CourseSelect;
  switch (scope) {
    case RoleScope.INSIDIA:
      return (select = courseInsidiaListSelect);

    case RoleScope.MITRA:
      return (select = courseMitraListSelect);

    default:
      return (select = courseInsidiaListSelect);
  }
};
