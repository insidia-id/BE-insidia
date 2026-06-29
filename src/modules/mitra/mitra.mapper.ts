import type { CreateMitraDto } from './dto/create-mitra.dto';
import type { Prisma } from '@prisma/client';

export function mapCreateUserData(
  dto: CreateMitraDto,
  slug: string,
): Prisma.MitraCreateInput {
  const data = {} as Prisma.MitraCreateInput;

  assignCreateMitraData(dto, data, slug);
  return data;
}

function assignCreateMitraData(
  dto: CreateMitraDto,
  data: Prisma.MitraCreateInput,
  slug: string,
) {
  data.name = dto.name.trim();
  data.slug = slug;
  data.type = dto.type;
  data.status = dto.status;

  if (dto.mitraProfile) {
    data.mitraProfile = {
      create: {
        npsn: dto.mitraProfile.npsn.trim(),
        address: dto.mitraProfile.address?.trim() ?? null,
      },
    };
  }
}
