import { PrismaService } from '../../infrastruktur/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  academicClassListSelect,
  academicClassDetailSelect,
} from './academic-class.constants';
@Injectable()
export class AcademicClassRepository {
  constructor(private readonly prisma: PrismaService) {}
  createAcademicClass(data: Prisma.AcademicClassCreateInput) {
    return this.prisma.academicClass.create({
      data,
    });
  }

  findAcademicClasses(mitraId: string) {
    return this.prisma.academicClass.findMany({
      where: {
        mitraId,
        deletedAt: null,
      },
      orderBy: [{ academicYear: { startDate: 'desc' } }, { name: 'asc' }],
      select: academicClassListSelect,
    });
  }

  findAcademicClassById(id: string) {
    return this.prisma.academicClass.findUnique({
      where: { id },
      select: academicClassDetailSelect,
    });
  }

  updateAcademicClass(id: string, data: Prisma.AcademicClassUpdateInput) {
    return this.prisma.academicClass.update({
      where: { id },
      data,
      select: academicClassDetailSelect,
    });
  }
}
