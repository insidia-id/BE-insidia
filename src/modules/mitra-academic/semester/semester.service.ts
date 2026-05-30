import { AcademicStatus } from '@prisma/client';
import { Injectable } from '@nestjs/common';
import type { AuthPayload } from '../../auth/auth.types';
import { serializeSemester } from '../mitra-academic.mapper';
import { MitraAcademicRepository } from '../mitra-academic.repository';
import { MitraAcademicAccessService } from '../shared/mitra-academic-access.service';
import { mitraAcademicPermissionCodes } from '../shared/mitra-academic-permission.constants';
import type { CreateSemesterDto, UpdateSemesterDto } from './semester.dto';

@Injectable()
export class SemesterService {
  constructor(
    private readonly repository: MitraAcademicRepository,
    private readonly access: MitraAcademicAccessService,
  ) {}

  async createSemester(
    mitraId: string,
    dto: CreateSemesterDto,
    auth: AuthPayload,
  ) {
    await this.access.ensureActor(
      auth.sub,
      mitraId,
      mitraAcademicPermissionCodes.semester.create,
    );
    const academicYear = await this.access.ensureAcademicYear(
      dto.academicYearId,
      mitraId,
    );

    try {
      const created = await this.repository.createSemester({
        mitra: { connect: { id: mitraId } },
        academicYear: { connect: { id: academicYear.id } },
        name: dto.name,
        startDate: dto.startDate,
        endDate: dto.endDate,
        status: dto.status,
      });

      return serializeSemester(created);
    } catch (error) {
      this.access.handlePrismaError(error);
    }
  }

  async findSemesters(mitraId: string, auth: AuthPayload) {
    await this.access.ensureActor(
      auth.sub,
      mitraId,
      mitraAcademicPermissionCodes.semester.view,
    );
    const items = await this.repository.findSemesters(mitraId);
    return items.map(serializeSemester);
  }

  async findSemester(mitraId: string, id: string, auth: AuthPayload) {
    await this.access.ensureActor(
      auth.sub,
      mitraId,
      mitraAcademicPermissionCodes.semester.view,
    );
    const item = await this.access.ensureSemester(id, mitraId);
    return serializeSemester(item);
  }

  async updateSemester(
    mitraId: string,
    id: string,
    dto: UpdateSemesterDto,
    auth: AuthPayload,
  ) {
    await this.access.ensureActor(
      auth.sub,
      mitraId,
      mitraAcademicPermissionCodes.semester.update,
    );
    await this.access.ensureSemester(id, mitraId);

    if (dto.academicYearId) {
      await this.access.ensureAcademicYear(dto.academicYearId, mitraId);
    }

    try {
      const updated = await this.repository.updateSemester(id, {
        ...(dto.academicYearId !== undefined
          ? { academicYear: { connect: { id: dto.academicYearId } } }
          : {}),
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.startDate !== undefined ? { startDate: dto.startDate } : {}),
        ...(dto.endDate !== undefined ? { endDate: dto.endDate } : {}),
        ...(dto.status !== undefined ? { status: dto.status } : {}),
      });

      return serializeSemester(updated);
    } catch (error) {
      this.access.handlePrismaError(error);
    }
  }

  async removeSemester(mitraId: string, id: string, auth: AuthPayload) {
    await this.access.ensureActor(
      auth.sub,
      mitraId,
      mitraAcademicPermissionCodes.semester.remove,
    );
    await this.access.ensureSemester(id, mitraId);
    await this.repository.updateSemester(id, {
      status: AcademicStatus.INACTIVE,
      deletedAt: new Date(),
    });
    return { message: 'Semester berhasil dihapus' };
  }
}
