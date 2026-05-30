import { Injectable } from '@nestjs/common';
import { Prisma, RoleScope, UserStatus } from '@prisma/client';
import { PrismaService } from '../../infrastruktur/prisma/prisma.service';
import {
  adminRoles,
  adminUserCreatedSelect,
  adminUserListSelect,
  adminUserSelect,
  getUserRoleScopeWhere,
  getUserRoleWhereByScope,
  UserFilter,
  userRole,
} from './user.constants';
import { DuplicateUserFieldError } from './user.errors';
import { CreateUserDto } from './dto/create-user.dto';
import { mapBulkUploadUserUpsertData, normalizeEmail } from './user.mapper';

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

  findAllActive(scope: RoleScope = RoleScope.INSIDIA, mitraId?: string) {
    return this.prisma.user.findMany({
      where: {
        deletedAt: null,
        ...getUserRoleScopeWhere(scope, mitraId),
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: adminUserListSelect,
    });
  }

  findAllByRoles({
    filter,
    roles,
    scope,
  }: {
    filter?: UserFilter;
    roles: string[];
    scope: RoleScope;
  }) {
    const whereClause: Prisma.UserWhereInput = {
      ...getUserRoleWhereByScope({
        scope,
        roles,
      }),
    };

    if (filter === 'deleted') {
      whereClause.deletedAt = { not: null };
    } else if (filter !== 'all') {
      whereClause.deletedAt = null;
    }

    return this.prisma.user.findMany({
      where: whereClause,
      orderBy: {
        createdAt: 'desc',
      },
      select: adminUserListSelect,
    });
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
  findAll(scope: RoleScope = RoleScope.INSIDIA, mitraId?: string) {
    return this.prisma.user.findMany({
      where: getUserRoleScopeWhere(scope, mitraId),
      orderBy: {
        createdAt: 'desc',
      },
      select: adminUserListSelect,
    });
  }

  findAllDeleted(scope: RoleScope = RoleScope.INSIDIA, mitraId?: string) {
    return this.prisma.user.findMany({
      where: {
        deletedAt: { not: null },
        ...getUserRoleScopeWhere(scope, mitraId),
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: adminUserListSelect,
    });
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
      select: adminUserListSelect,
    });
  }

  findByPhone(phone: string) {
    return this.prisma.user.findFirst({
      where: {
        phone,
      },
      select: adminUserListSelect,
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
