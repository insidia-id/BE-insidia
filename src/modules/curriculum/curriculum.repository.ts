import { Prisma } from '@prisma/client';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastruktur/prisma/prisma.service';
import {
  curriculumListSelect,
  curriculumDetailSelect,
} from './curriculum.constants';

@Injectable()
export class CurriculumRepository {
  constructor(private readonly prisma: PrismaService) {}
  createCurriculum(data: Prisma.CurriculumCreateInput) {
    return this.prisma.curriculum.create({
      data,
    });
  }

  findCurricula(mitraId: string) {
    return this.prisma.curriculum.findMany({
      where: {
        mitraId,
        deletedAt: null,
      },
      orderBy: {
        name: 'asc',
      },
      select: curriculumListSelect,
    });
  }

  findCurriculumById(id?: string) {
    return this.prisma.curriculum.findUnique({
      where: { id },
      select: curriculumDetailSelect,
    });
  }

  updateCurriculum(id: string, data: Prisma.CurriculumUpdateInput) {
    return this.prisma.curriculum.update({
      where: { id },
      data,
      select: curriculumDetailSelect,
    });
  }
}
