import { Prisma } from '@prisma/client';
export const courseModulesPermissionCodes = {
  create: 'courseModules.create.insidia',
  view: 'courseModules.view.insidia',
  update: 'courseModules.update.insidia',
  remove: 'courseModules.remove.insidia',
} as const;

export const BaseCourseModuleSelect = {
  id: true,
  title: true,
  summary: true,
  sortOrder: true,
  createdAt: true,
  updatedAt: true,
  _count: {
    select: {
      learningItems: true,
    },
  },
  learningItems: {
    select: {
      type: true,
    },
  },
} satisfies Prisma.ModuleSelect;

export const courseModuleMitra = {
  classGroupCourseId: true,
  classGroupCourse: {
    select: {
      id: true,
      teacherId: true,
      courseMitra: {
        select: {
          course: {
            select: {
              id: true,
              title: true,
              scope: true,
            },
          },
        },
      },
    },
  },
} satisfies Prisma.ModuleSelect;

export const courseModuleInsidia = {
  courseInsidiaId: true,
  courseInsidia: {
    select: {
      id: true,
      course: {
        select: {
          id: true,
          creatorId: true,
          title: true,
          scope: true,
        },
      },
    },
  },
} satisfies Prisma.ModuleSelect;

export const ensureMuridregistered = {
  classGroupCourseId: true,
  classGroupCourse: {
    select: {
      classGroup: {
        select: {
          classGroupStudents: {
            select: {
              studentId: true,
            },
          },
        },
      },
    },
  },
};

export const courseModuleSelect = {
  ...BaseCourseModuleSelect,
  ...courseModuleInsidia,
  ...courseModuleMitra,
} satisfies Prisma.ModuleSelect;

export const courseModuleMitraSelect = {
  ...BaseCourseModuleSelect,
  ...courseModuleMitra,
} satisfies Prisma.ModuleSelect;

export const courseModuleInsidiaSelect = {
  ...BaseCourseModuleSelect,
  ...courseModuleInsidia,
} satisfies Prisma.ModuleSelect;

export type ModuleDomainContext =
  | { domain: 'INSIDIA'; courseInsidiaId: string }
  | { domain: 'MITRA'; classGroupCourseId: string };

export type CourseModuleRecord = Prisma.ModuleGetPayload<{
  select: typeof courseModuleSelect;
}>;

export type CourseModuleMitraRecord = Prisma.ModuleGetPayload<{
  select: typeof courseModuleMitraSelect;
}>;

export type CourseModuleInsidiaRecord = Prisma.ModuleGetPayload<{
  select: typeof courseModuleInsidiaSelect;
}>;
