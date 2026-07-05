import { Injectable } from '@nestjs/common';
import { Prisma, AcademicStatus } from '@prisma/client';
import { PrismaService } from '../../infrastruktur/prisma/prisma.service';
import { semesterListSelect, semesterDetailSelect } from './semester.constants';

@Injectable()
export class SemesterRepository {
  constructor(private readonly prisma: PrismaService) {}

  createSemester(data: Prisma.SemesterCreateInput) {
    return this.prisma.semester.create({
      data,
    });
  }

  findActiveSemester(mitraId: string, academicYearId?: string) {
    return this.prisma.semester.findFirst({
      where: {
        mitraId,
        academicYearId,
        status: AcademicStatus.ACTIVE,
        deletedAt: null,
      },
      orderBy: {
        startDate: 'desc',
      },
      select: semesterDetailSelect,
    });
  }

  findSemesters(mitraId: string) {
    return this.prisma.semester.findMany({
      where: {
        mitraId,
        deletedAt: null,
      },
      orderBy: {
        startDate: 'desc',
      },
      select: semesterListSelect,
    });
  }

  findSemesterById(id: string) {
    return this.prisma.semester.findUnique({
      where: { id },
      select: semesterDetailSelect,
    });
  }

  updateSemester(id: string, data: Prisma.SemesterUpdateInput) {
    return this.prisma.semester.update({
      where: {
        id,
      },
      data,
      select: semesterDetailSelect,
    });
  }
}
