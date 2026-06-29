import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../infrastruktur/prisma/prisma.service';
import { MitraFilter } from './mitra.types';
import {
  mitraSelect,
  mitraMemberSelect,
  mitraProfileSelect,
} from './mitra.constants';

@Injectable()
export class MitraRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.MitraCreateInput) {
    return this.prisma.mitra.create({
      data,
      select: mitraSelect,
    });
  }

  findAll({ filter, keyword }: { filter: MitraFilter; keyword?: string }) {
    const where: Prisma.MitraWhereInput =
      filter === 'available'
        ? { deletedAt: null }
        : filter === 'deleted'
          ? { deletedAt: { not: null } }
          : {};

    if (keyword) {
      where.OR = [
        {
          name: {
            contains: keyword,
          },
        },
        {
          slug: {
            contains: keyword,
          },
        },
      ];
    }

    return this.prisma.mitra.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      select: mitraSelect,
    });
  }

  findById(id: string) {
    return this.prisma.mitra.findUnique({
      where: { id },
      select: { ...mitraSelect, mitraProfile: { select: mitraProfileSelect } },
    });
  }

  findBySlug(slug: string) {
    return this.prisma.mitra.findUnique({
      where: { slug },
      select: { ...mitraSelect, mitraProfile: { select: mitraProfileSelect } },
    });
  }

  update(id: string, data: Prisma.MitraUpdateInput) {
    return this.prisma.mitra.update({
      where: { id },
      data,
      select: { ...mitraSelect, mitraProfile: { select: mitraProfileSelect } },
    });
  }

  softDelete(id: string) {
    return this.prisma.mitra.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
      select: { ...mitraSelect, mitraProfile: { select: mitraProfileSelect } },
    });
  }

  findUserById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        deletedAt: true,
      },
    });
  }

  findRoleByCode(code: string) {
    return this.prisma.role.findUnique({
      where: { code },
      select: {
        id: true,
        code: true,
        name: true,
        scope: true,
        deletedAt: true,
      },
    });
  }

  findMembersByMitraId(mitraId: string) {
    return this.prisma.userMitraRole.findMany({
      where: {
        mitraId,
      },
      orderBy: [{ role: { name: 'asc' } }, { user: { name: 'asc' } }],
      select: mitraMemberSelect,
    });
  }

  findMemberById(id: string) {
    return this.prisma.userMitraRole.findUnique({
      where: { id },
      select: mitraMemberSelect,
    });
  }

  findMemberByComposite(params: {
    userId: string;
    mitraId: string;
    roleId: string;
  }) {
    return this.prisma.userMitraRole.findFirst({
      where: params,
      select: mitraMemberSelect,
    });
  }

  createMember(data: Prisma.UserMitraRoleCreateInput) {
    return this.prisma.userMitraRole.create({
      data,
      select: mitraMemberSelect,
    });
  }

  removeMember(id: string) {
    return this.prisma.userMitraRole.delete({
      where: { id },
      select: mitraMemberSelect,
    });
  }
}
