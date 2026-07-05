import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../infrastruktur/prisma/prisma.service';

const mitraRoleSummarySelect = {
  id: true,
  mitraId: true,
  role: {
    select: {
      id: true,
      code: true,
      name: true,
      scope: true,
    },
  },
} satisfies Prisma.UserMitraRoleSelect;

export const mitraAcademicActorSelect = {
  id: true,
  name: true,
  email: true,
  status: true,
  insidiaRole: {
    select: {
      role: {
        select: {
          id: true,
          code: true,
          scope: true,
        },
      },
    },
  },
  mitraRoles: {
    select: mitraRoleSummarySelect,
  },
} satisfies Prisma.UserSelect;

@Injectable()
export class MitraAcademicRepository {
  constructor(private readonly prisma: PrismaService) {}

  findActorContext(userId: string, mitraId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        ...mitraAcademicActorSelect,
        mitraRoles: {
          where: {
            mitraId,
          },
          select: mitraRoleSummarySelect,
        },
      },
    });
  }

  findUserMitraRoleByCode(userId: string, mitraId: string, roleCode: string) {
    return this.prisma.userMitraRole.findFirst({
      where: {
        userId,
        mitraId,
        role: {
          code: roleCode,
        },
      },
      select: mitraRoleSummarySelect,
    });
  }
}
