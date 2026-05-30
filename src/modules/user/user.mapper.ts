import { Prisma } from '@prisma/client';
import { withInsidiaAccess } from '../access-control/access-control.utils';
import type { CreateUserDto } from './dto/create-user.dto';
import type { UpdateUserDto } from './dto/update-user.dto';
import type { insidiaRole } from './user.types';
export function mapCreateUserData(
  dto: CreateUserDto,
  actorId: string | undefined,
): Prisma.UserCreateInput {
  const data = {} as Prisma.UserCreateInput;

  if (actorId) {
    data.createdBy = {
      connect: {
        id: actorId,
      },
    };
  }

  assignCreateUserFields(data, dto);

  return data;
}

export function mapUpdateUserData(dto: UpdateUserDto): Prisma.UserUpdateInput {
  const data: Prisma.UserUpdateInput = {};
  assignUpdateUserFields(data, dto);

  return data;
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function serializeUserWithAccess<
  T extends Parameters<typeof withInsidiaAccess>[0],
>(user: T) {
  return withInsidiaAccess(user);
}

function assignCreateUserFields(
  data: Prisma.UserCreateInput,
  dto: CreateUserDto,
) {
  data.email = dto.email.trim();
  data.normalizedEmail = normalizeEmail(dto.email);

  data.name = dto.name ?? null;
  data.phone = dto.phone ?? null;
  data.status = dto.status ?? 'ACTIVE';
  data.insidiaRole = {
    create: {
      role: {
        connect: {
          code: dto.role ?? 'USER',
        },
      },
    },
  };
  if (dto.scope === 'MITRA') {
    data.mitraRoles = {
      create: {
        role: {
          connect: {
            code: dto.mitraRole,
          },
        },
        mitra: {
          connect: {
            id: dto.mitraId,
          },
        },
      },
    };
  }
}

function assignUpdateUserFields(
  data: Prisma.UserUpdateInput,
  dto: UpdateUserDto,
) {
  if (dto.email !== undefined) {
    data.email = dto.email.trim();
    data.normalizedEmail = normalizeEmail(dto.email);
  }

  if (dto.name !== undefined) data.name = dto.name;
  if (dto.phone !== undefined) data.phone = dto.phone;
  if (dto.status !== undefined) data.status = dto.status;

  if (dto.role !== undefined) {
    data.insidiaRole = {
      upsert: {
        create: {
          role: {
            connect: {
              code: dto.role,
            },
          },
        },
        update: {
          role: {
            connect: {
              code: dto.role,
            },
          },
        },
      },
    };
  }
  if (dto.mitraRole !== undefined && dto.mitraId !== undefined) {
    data.mitraRoles = {
      upsert: {
        create: {
          mitra: {
            connect: { id: dto.mitraId },
          },
          role: {
            connect: { code: dto.mitraRole },
          },
        },
        update: {
          role: {
            connect: { code: dto.mitraRole },
          },
        },
      },
    };
  }
  if (dto.bio !== undefined) data.bio = dto.bio;
  if (dto.websiteUrl !== undefined) data.websiteUrl = dto.websiteUrl;

  if (dto.socialLinks !== undefined) {
    data.socialLinks =
      dto.socialLinks === null ? Prisma.JsonNull : dto.socialLinks;
  }
}
