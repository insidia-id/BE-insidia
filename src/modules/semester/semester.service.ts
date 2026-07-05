import { AcademicStatus } from '@prisma/client';
import { Injectable, NotFoundException } from '@nestjs/common';
import {
  buildCreateSemester,
  buildUpdateSemester,
  serializeSemester,
} from './semester.mapper';
import { SemesterRepository } from './semester.repository';
import { MitraAcademicAccessService } from '../mitra-academic/shared/mitra-academic-access.service';
import { semesterPermissionCodes } from './semester.constants';
import type { CreateSemesterDto, UpdateSemesterDto } from './dto/semester.dto';
import { AcademicYearService } from '../academic-year/academic-year.service';
import { AuthenticatedRequest } from 'src/shared/guards/access-token.guard';
@Injectable()
export class SemesterService {
  constructor(
    private readonly repository: SemesterRepository,
    private readonly access: MitraAcademicAccessService,
    private readonly academicYearService: AcademicYearService,
  ) {}

  async createSemester(
    mitraId: string,
    dto: CreateSemesterDto,
    request: AuthenticatedRequest,
  ) {
    await this.access.ensureActor(
      request.auth.sub,
      mitraId,
      semesterPermissionCodes.semester.create,
    );
    const academicYear = await this.academicYearService.ensureAcademicYear(
      dto.academicYearId,
      mitraId,
    );

    try {
      const created = await this.repository.createSemester(
        buildCreateSemester(mitraId, academicYear.id, dto),
      );

      return serializeSemester(created);
    } catch (error) {
      this.access.handlePrismaError(error);
    }
  }

  async findSemesters(mitraId: string, request: AuthenticatedRequest) {
    await this.access.ensureActor(
      request.auth.sub,
      mitraId,
      semesterPermissionCodes.semester.view,
    );
    const items = await this.repository.findSemesters(mitraId);
    return items.map(serializeSemester);
  }

  async findSemester(
    mitraId: string,
    id: string,
    request: AuthenticatedRequest,
  ) {
    await this.access.ensureActor(
      request.auth.sub,
      mitraId,
      semesterPermissionCodes.semester.view,
    );
    const item = await this.ensureSemester(id, mitraId);
    return serializeSemester(item);
  }

  async updateSemester(
    mitraId: string,
    id: string,
    dto: UpdateSemesterDto,
    request: AuthenticatedRequest,
  ) {
    await this.access.ensureActor(
      request.auth.sub,
      mitraId,
      semesterPermissionCodes.semester.update,
    );
    const semester = await this.ensureSemester(id, mitraId);

    if (dto.academicYearId) {
      await this.academicYearService.ensureAcademicYear(
        dto.academicYearId,
        mitraId,
      );
    }

    try {
      const updated = await this.repository.updateSemester(
        id,
        buildUpdateSemester(dto, semester),
      );

      return serializeSemester(updated);
    } catch (error) {
      this.access.handlePrismaError(error);
    }
  }

  async removeSemester(
    mitraId: string,
    id: string,
    request: AuthenticatedRequest,
  ) {
    await this.access.ensureActor(
      request.auth.sub,
      mitraId,
      semesterPermissionCodes.semester.remove,
    );
    await this.ensureSemester(id, mitraId);
    await this.repository.updateSemester(id, {
      status: AcademicStatus.INACTIVE,
      deletedAt: new Date(),
    });
    return { message: 'Semester berhasil dihapus' };
  }

  async ensureSemester(id: string, mitraId: string) {
    const item = await this.repository.findSemesterById(id);

    if (!item || item.deletedAt || item.mitraId !== mitraId) {
      throw new NotFoundException('Semester tidak ditemukan');
    }

    return item;
  }
  async findActiveSemester(mitraId: string, academicYearId?: string) {
    const item = await this.repository.findActiveSemester(
      mitraId,
      academicYearId,
    );
    if (!item || item.deletedAt || item.mitraId !== mitraId) {
      throw new NotFoundException('Semester aktif tidak ditemukan');
    }

    return item;
  }
}
