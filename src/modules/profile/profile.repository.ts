import { Prisma } from '@prisma/client';
import { PrismaService } from '../../infrastruktur/prisma/prisma.service';
import type { MuridProfilePayload, GuruProfilePayload } from './profile.types';

export class ProfileRepository {
  constructor(private readonly prisma: PrismaService) {}

  createMuridProfile(userMitraRoleId: string, data: MuridProfilePayload) {
    return this.prisma.muridProfile.create({
      data: {
        usermitrarole: {
          connect: { id: userMitraRoleId },
        },

        nis: data.nis ?? null,
        kelas: data.kelas ?? null,
        jurusan: data.jurusan ?? null,

        wali: data.waliId ? { connect: { id: data.waliId } } : undefined,
      },
    });
  }

  createGuruProfile(userMitraRoleId: string, data: GuruProfilePayload) {
    return this.prisma.guruProfile.create({
      data: {
        usermitrarole: {
          connect: { id: userMitraRoleId },
        },
        nip: data.nip ?? null,
      },
    });
  }
}
