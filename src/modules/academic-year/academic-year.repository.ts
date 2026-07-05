import { Prisma, PrismaClient, AcademicStatus } from '@prisma/client';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastruktur/prisma/prisma.service';
import {
  academicYearListSelect,
  academicYearDetailSelect,
} from './academic-year.constants';
@Injectable()
export class AcademicYearRepository {
  constructor(private readonly prisma: PrismaService) {}

  findActiveAcademicYear(mitraId: string) {
    return this.prisma.academicYear.findFirst({
      where: {
        mitraId,
        status: AcademicStatus.ACTIVE,
        deletedAt: null,
      },
      orderBy: {
        startDate: 'desc',
      },
      select: academicYearDetailSelect,
    });
  }

  createAcademicYear(data: Prisma.AcademicYearCreateInput) {
    return this.prisma.academicYear.create({
      data,
    });
  }

  findAcademicYears(mitraId: string) {
    return this.prisma.academicYear.findMany({
      where: {
        mitraId,
        deletedAt: null,
      },
      orderBy: {
        startDate: 'desc',
      },
      select: academicYearListSelect,
    });
  }

  findAcademicYearById(id: string) {
    return this.prisma.academicYear.findUnique({
      where: { id },
      select: academicYearDetailSelect,
    });
  }

  updateAcademicYear(id: string, data: Prisma.AcademicYearUpdateInput) {
    return this.prisma.academicYear.update({
      where: { id },
      data,
      select: academicYearDetailSelect,
    });
  }
}
