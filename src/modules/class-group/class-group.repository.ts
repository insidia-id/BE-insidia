import { PrismaService } from '../../infrastruktur/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  classGroupListSelect,
  classGroupDetailSelect,
} from '../class-group/class-group.constants';
@Injectable()
export class AcademicClassRepository {
  constructor(private readonly prisma: PrismaService) {}

  createClassGroup(data: Prisma.ClassGroupCreateInput) {
    return this.prisma.classGroup.create({
      data,
    });
  }

  findClassGroups(mitraId: string) {
    return this.prisma.classGroup.findMany({
      where: {
        mitraId,
        deletedAt: null,
      },
      orderBy: [{ academicClass: { name: 'asc' } }, { name: 'asc' }],
      select: classGroupListSelect,
    });
  }

  findClassGroupById(id: string) {
    return this.prisma.classGroup.findUnique({
      where: { id },
      select: classGroupDetailSelect,
    });
  }

  updateClassGroup(id: string, data: Prisma.ClassGroupUpdateInput) {
    return this.prisma.classGroup.update({
      where: { id },
      data,
      select: classGroupDetailSelect,
    });
  }
}
