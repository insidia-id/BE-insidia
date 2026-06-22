import { randomUUID } from 'crypto';
import { Prisma } from '@prisma/client';
import {
  InsidiaAccessCarrier,
  MitraAccessCarrier,
  withInsidiaAccess,
  withMitraAccess,
} from '../access-control/access-control.utils';
import type { CreateUserDto, MitraRoleItemInput } from './dto/create-user.dto';
import type { UpdateUserDto } from './dto/update-user.dto';
import type { MitraRoleProfileInput } from './dto/create-user.dto';
export function mapCreateUserData(
  dto: CreateUserDto,
  actorId: string | undefined,
): Prisma.UserCreateInput {
  const userId = randomUUID();
  const data = {
    id: userId,
  } as Prisma.UserCreateInput;

  if (actorId) {
    data.createdBy = {
      connect: {
        id: actorId,
      },
    };
  }

  assignCreateUserFields(data, dto, userId);

  return data;
}

export function mapUpdateUserData(
  dto: UpdateUserDto,
  userId: string,
): Prisma.UserUpdateInput {
  const data: Prisma.UserUpdateInput = {};
  assignUpdateUserFields(data, userId, dto);

  return data;
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export type UserAccessCarrier = InsidiaAccessCarrier & MitraAccessCarrier;
export function serializeUserWithAccess(user: UserAccessCarrier) {
  return {
    ...withInsidiaAccess(user),
    ...withMitraAccess(user),
  };
}

function assignCreateUserFields(
  data: Prisma.UserCreateInput,
  dto: CreateUserDto,
  userId: string,
) {
  data.email = dto.email.trim();
  data.normalizedEmail = normalizeEmail(dto.email);

  data.name = dto.name ?? null;
  data.phone = dto.phone?.trim() ?? null;

  data.status = dto.status ?? 'ACTIVE';

  data.nik = dto.nik?.trim() ?? null;
  data.birthPlace = dto.birthPlace?.trim() ?? null;

  data.birthDate = dto.birthDate ? new Date(dto.birthDate) : null;

  data.gender = dto.gender ?? null;
  data.religion = dto.religion ?? null;

  data.insidiaRole = {
    create: {
      role: {
        connect: {
          code: dto.role ?? 'USER',
        },
      },
    },
  };

  if (dto.mitraRoles && dto.mitraRoles.length > 0) {
    const roles = dto.mitraRoles ?? [];

    const unique = Array.from(
      new Map(roles.map((i) => [i.mitraId, i] as const)).values(),
    );

    if (unique.length > 0) {
      data.mitraRoles = {
        create: unique.map((item) => ({
          mitra: {
            connect: { id: item.mitraId },
          },
          role: {
            connect: { code: item.roleCode },
          },
          ...buildMitraRoleProfileNestedCreate(item, userId),
        })),
      };
    }
  }
}

function assignUpdateUserFields(
  data: Prisma.UserUpdateInput,
  userId: string,
  dto: UpdateUserDto,
) {
  if (dto.email !== undefined) {
    data.email = dto.email.trim();
    data.normalizedEmail = normalizeEmail(dto.email);
  }

  if (dto.name !== undefined) data.name = dto.name;
  if (dto.phone !== undefined) data.phone = dto.phone;
  if (dto.status !== undefined) data.status = dto.status;
  if (dto.nik !== undefined) data.nik = dto.nik;
  if (dto.birthPlace !== undefined) data.birthPlace = dto.birthPlace;
  if (dto.birthDate !== undefined) data.birthDate = dto.birthDate;
  if (dto.gender !== undefined) data.gender = dto.gender;
  if (dto.religion !== undefined) data.religion = dto.religion;

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
  if (dto.mitraRoles !== undefined) {
    const uniqueMitraRoles = Array.from(
      new Map(dto.mitraRoles.map((item) => [item.mitraId, item])).values(),
    );

    data.mitraRoles = {
      upsert: uniqueMitraRoles.map((item) => ({
        where: {
          userId_mitraId: {
            userId: userId,
            mitraId: item.mitraId,
          },
        },
        create: {
          mitra: {
            connect: {
              id: item.mitraId,
            },
          },
          role: {
            connect: {
              code: item.roleCode,
            },
          },
          ...buildMitraRoleProfileNestedCreate(item, userId),
        },
        update: {
          role: {
            connect: {
              code: item.roleCode,
            },
          },
          ...buildMitraRoleProfileNestedUpsert(item, userId),
        },
      })),
    };
  }
  if (dto.bio !== undefined) data.bio = dto.bio;
  if (dto.websiteUrl !== undefined) data.websiteUrl = dto.websiteUrl;

  if (dto.socialLinks !== undefined) {
    data.socialLinks =
      dto.socialLinks === null ? Prisma.JsonNull : dto.socialLinks;
  }
}

function assignScalarUpdateUserFields(
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
  if (dto.nik !== undefined) data.nik = dto.nik;
  if (dto.birthPlace !== undefined) data.birthPlace = dto.birthPlace;
  if (dto.birthDate !== undefined) data.birthDate = dto.birthDate;
  if (dto.gender !== undefined) data.gender = dto.gender;
  if (dto.religion !== undefined) data.religion = dto.religion;
  if (dto.bio !== undefined) data.bio = dto.bio;
  if (dto.websiteUrl !== undefined) data.websiteUrl = dto.websiteUrl;

  if (dto.socialLinks !== undefined) {
    data.socialLinks =
      dto.socialLinks === null ? Prisma.JsonNull : dto.socialLinks;
  }
}

function nullableTrim(value: string | null | undefined) {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

function hasAnyProfileValue(
  profile: MitraRoleProfileInput | undefined,
  fields: Array<keyof MitraRoleProfileInput>,
) {
  if (!profile) return false;

  return fields.some((field) => nullableTrim(profile[field]) !== null);
}

function buildMitraRoleProfileNestedCreate(
  item: MitraRoleItemInput,
  userId: string,
): Partial<Prisma.UserMitraRoleCreateWithoutUserInput> {
  if (
    item.roleCode === 'GURU' &&
    hasAnyProfileValue(item.profile, ['nip', 'subject', 'bio'])
  ) {
    return {
      guruProfile: {
        create: {
          nip: nullableTrim(item.profile?.nip),
          subject: nullableTrim(item.profile?.subject),
          bio: nullableTrim(item.profile?.bio),
        },
      },
    };
  }

  if (
    item.roleCode === 'MURID' &&
    hasAnyProfileValue(item.profile, ['nis', 'kelas', 'jurusan', 'waliId'])
  ) {
    return {
      muridProfile: {
        create: {
          nis: nullableTrim(item.profile?.nis),
          kelas: nullableTrim(item.profile?.kelas),
          jurusan: nullableTrim(item.profile?.jurusan),
          wali: nullableTrim(item.profile?.waliId)
            ? {
                connect: {
                  id: nullableTrim(item.profile?.waliId) as string,
                },
              }
            : undefined,
        },
      },
    };
  }

  if (
    item.roleCode === 'WALI_MURID' &&
    hasAnyProfileValue(item.profile, ['pekerjaan', 'alamat'])
  ) {
    return {
      waliProfile: {
        create: {
          userId,
          pekerjaan: nullableTrim(item.profile?.pekerjaan),
          alamat: nullableTrim(item.profile?.alamat),
        },
      },
    };
  }

  if (
    item.roleCode === 'AKADEMIK' &&
    hasAnyProfileValue(item.profile, ['position', 'division', 'note'])
  ) {
    return {
      academicProfile: {
        create: {
          position: nullableTrim(item.profile?.position),
          division: nullableTrim(item.profile?.division),
          note: nullableTrim(item.profile?.note),
        },
      },
    };
  }

  return {};
}

function buildMitraRoleProfileNestedUpsert(
  item: MitraRoleItemInput,
  userId: string,
): Prisma.UserMitraRoleUpdateWithoutUserInput {
  if (
    item.roleCode === 'GURU' &&
    hasAnyProfileValue(item.profile, ['nip', 'subject', 'bio'])
  ) {
    const data = {
      nip: nullableTrim(item.profile?.nip),
      subject: nullableTrim(item.profile?.subject),
      bio: nullableTrim(item.profile?.bio),
    };

    return {
      guruProfile: {
        upsert: {
          create: data,
          update: data,
        },
      },
    };
  }

  if (
    item.roleCode === 'MURID' &&
    hasAnyProfileValue(item.profile, ['nis', 'kelas', 'jurusan', 'waliId'])
  ) {
    const waliId = nullableTrim(item.profile?.waliId);
    const data = {
      nis: nullableTrim(item.profile?.nis),
      kelas: nullableTrim(item.profile?.kelas),
      jurusan: nullableTrim(item.profile?.jurusan),
      wali: waliId ? { connect: { id: waliId } } : { disconnect: true },
    };

    return {
      muridProfile: {
        upsert: {
          create: data,
          update: data,
        },
      },
    };
  }

  if (
    item.roleCode === 'WALI_MURID' &&
    hasAnyProfileValue(item.profile, ['pekerjaan', 'alamat'])
  ) {
    const data = {
      userId,
      pekerjaan: nullableTrim(item.profile?.pekerjaan),
      alamat: nullableTrim(item.profile?.alamat),
    };

    return {
      waliProfile: {
        upsert: {
          create: data,
          update: data,
        },
      },
    };
  }

  if (
    item.roleCode === 'AKADEMIK' &&
    hasAnyProfileValue(item.profile, ['position', 'division', 'note'])
  ) {
    const data = {
      position: nullableTrim(item.profile?.position),
      division: nullableTrim(item.profile?.division),
      note: nullableTrim(item.profile?.note),
    };

    return {
      academicProfile: {
        upsert: {
          create: data,
          update: data,
        },
      },
    };
  }

  return {};
}

export function mapBulkUploadUserUpsertData(rawData: CreateUserDto): {
  create: Prisma.UserCreateInput;
  update: Prisma.UserUpdateInput;
} {
  const create = mapCreateUserData(rawData, undefined);
  const update: Prisma.UserUpdateInput = {};
  assignScalarUpdateUserFields(update, rawData as UpdateUserDto);

  return {
    create,
    update,
  };
}
