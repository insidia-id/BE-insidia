import { Injectable } from '@nestjs/common';
import { Prisma, RoleScope, UserStatus } from '@prisma/client';
import { PrismaService } from '../../infrastruktur/prisma/prisma.service';
import {
  adminRoles,
  adminUserCreatedSelect,
  adminUserListSelect,
  adminUserSelect,
  getUserFilterWhere,
  getUserRoleWhereByScope,
  UserFilter,
  userRole,
} from './user.constants';
import { DuplicateUserFieldError } from './user.errors';
import { CreateUserDto } from './dto/create-user.dto';
import { mapBulkUploadUserUpsertData, normalizeEmail } from './user.mapper';
import { RoleCode } from '../../shared/types/types';
import { PaginationQuery } from 'src/shared/zod/zod.schemas';
import { createPagination, getPagination } from 'src/shared/helper/helper';

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}
  async upsertBulkUser(rawData: CreateUserDto) {
    const { create, update } = mapBulkUploadUserUpsertData(rawData);

    return this.prisma.user.upsert({
      where: {
        normalizedEmail: normalizeEmail(rawData.email),
      },
      create,
      update,
    });
  }
  async create(data: Prisma.UserCreateInput) {
    try {
      return await this.prisma.user.create({
        data,
        select: adminUserCreatedSelect,
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: adminUserSelect,
    });
  }
  findRoleByUserId(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        insidiaRole: userRole.insidiaRole,
        mitraRoles: userRole.mitraRoles,
      },
    });
  }
  async findAll({
    scope,
    filter = 'available',
    mitraId,
    roleCode,
    excludeRoles,
    pagination = { page: 1, limit: 10 },
  }: {
    scope: RoleScope;
    filter?: UserFilter;
    mitraId?: string | null;
    roleCode?: RoleCode;
    excludeRoles?: RoleCode[];
    pagination: PaginationQuery;
  }) {
    const where: Prisma.UserWhereInput = {
      ...getUserFilterWhere(filter),
      ...getUserRoleWhereByScope({
        scope,
        mitraId,
        roleCode,
        excludeRoles,
      }),
    };
    const { skip, take } = getPagination(pagination.page, pagination.limit);
    const [users, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        skip,
        take,
        select: adminUserListSelect(mitraId ?? undefined),
        orderBy: {
          createdAt: 'desc',
        },
      }),

      this.prisma.user.count({
        where,
      }),
    ]);
    return {
      users,
      ...createPagination(pagination.page, pagination.limit, total),
    };
  }

  findActiveById(id: string) {
    return this.prisma.user.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      select: adminUserSelect,
    });
  }

  findByEmail(normalizedEmail: string) {
    return this.prisma.user.findUnique({
      where: {
        normalizedEmail,
      },
      select: {
        id: true,
        email: true,
        normalizedEmail: true,
      },
    });
  }

  findByPhone(phone: string) {
    return this.prisma.user.findFirst({
      where: {
        phone,
      },
      select: {
        id: true,
      },
    });
  }
  findByNik(nik: string) {
    return this.prisma.user.findFirst({
      where: {
        nik,
      },
    });
  }
  findUserMitraRoleByMitraId(userId: string, mitraId: string) {
    return this.prisma.userMitraRole.findFirst({
      where: {
        userId,
        mitraId,
      },
      select: {
        role: {
          select: {
            id: true,
            code: true,
          },
        },
      },
    });
  }
  async updateActive(id: string, data: Prisma.UserUpdateInput) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const existingUser = await tx.user.findFirst({
          where: {
            id,
            deletedAt: null,
          },
          select: {
            id: true,
          },
        });

        if (!existingUser) {
          return null;
        }

        await tx.user.update({
          where: { id },
          data,
        });

        return tx.user.findFirst({
          where: {
            id,
            deletedAt: null,
          },
          select: adminUserSelect,
        });
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async softDeleteActive(id: string) {
    const result = await this.prisma.user.updateMany({
      where: {
        id,
        deletedAt: null,
      },
      data: {
        deletedAt: new Date(),
        name: null,
        phone: null,
        image: null,
        bio: null,
        imagePublicId: null,
        phoneVerifiedAt: null,
        websiteUrl: null,
        socialLinks: Prisma.JsonNull,
      },
    });

    return result.count > 0;
  }

  countActiveAkademikByMitraId(mitraId: string) {
    return this.prisma.user.count({
      where: {
        deletedAt: null,
        status: UserStatus.ACTIVE,
        mitraRoles: {
          some: {
            mitraId,
            role: {
              code: 'AKADEMIK',
            },
          },
        },
      },
    });
  }

  countActiveAdmins() {
    return this.prisma.user.count({
      where: {
        deletedAt: null,
        status: UserStatus.ACTIVE,
        insidiaRole: {
          is: {
            role: {
              code: {
                in: [...adminRoles],
              },
            },
          },
        },
      },
    });
  }

  async deleteUserMitraRoles(userId: string, mitraId: string) {
    await this.prisma.userMitraRole.deleteMany({
      where: {
        userId,
        mitraId,
      },
    });
  }

  private handlePrismaError(error: unknown): never {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      const targets = Array.isArray(error.meta?.target)
        ? error.meta.target
        : this.extractUniqueTargetsFromMessage(error.message);

      if (targets.includes('normalizedEmail')) {
        throw new DuplicateUserFieldError('normalizedEmail');
      }

      if (targets.includes('phone')) {
        throw new DuplicateUserFieldError('phone');
      }

      throw new DuplicateUserFieldError('unknown');
    }

    throw error;
  }

  private extractUniqueTargetsFromMessage(message: string) {
    const normalizedMessage = message.toLowerCase();
    const targets: string[] = [];

    if (normalizedMessage.includes('normalizedemail')) {
      targets.push('normalizedEmail');
    }

    if (normalizedMessage.includes('phone')) {
      targets.push('phone');
    }

    return targets;
  }
}
