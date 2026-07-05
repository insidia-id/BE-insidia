import { PrismaService } from '../../infrastruktur/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  classGroupStudentDetailSelect,
  classGroupStudentListSelect,
} from './class-group-student.constants';

@Injectable()
export class ClassGroupStudentRepository {
  constructor(private readonly prisma: PrismaService) {}
  createClassGroupStudent(data: Prisma.ClassGroupStudentCreateInput) {
    return this.prisma.classGroupStudent.create({
      data,
    });
  }

  findClassGroupStudentById(id: string) {
    return this.prisma.classGroupStudent.findUnique({
      where: { id },
      select: classGroupStudentDetailSelect,
    });
  }

  findClassGroupStudents(params: {
    mitraId: string;
    classGroupId?: string;
    studentId?: string;
    academicYearId?: string;
    semesterId?: string;
  }) {
    return this.prisma.classGroupStudent.findMany({
      where: {
        mitraId: params.mitraId,
        ...(params.classGroupId ? { classGroupId: params.classGroupId } : {}),
        ...(params.studentId ? { studentId: params.studentId } : {}),
        ...(params.academicYearId
          ? { academicYearId: params.academicYearId }
          : {}),
        ...(params.semesterId ? { semesterId: params.semesterId } : {}),
        deletedAt: null,
      },
      orderBy: [{ classGroup: { name: 'asc' } }, { student: { name: 'asc' } }],
      select: classGroupStudentListSelect,
    });
  }
  updateClassGroupStudent(
    id: string,
    data: Prisma.ClassGroupStudentUpdateInput,
  ) {
    return this.prisma.classGroupStudent.update({
      where: { id },
      data,
      select: classGroupStudentDetailSelect,
    });
  }
}
