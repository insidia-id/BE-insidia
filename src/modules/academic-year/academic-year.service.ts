import { AcademicStatus } from '@prisma/client';
import { Injectable, NotFoundException } from '@nestjs/common';
import {
  buildCreateAcademicYear,
  buildUpdateAcademicYear,
  serializeAcademicYear,
} from './academic-year.mapper';
import { AcademicYearRepository } from './academic-year.repository';
import { MitraAcademicAccessService } from '../mitra-academic/shared/mitra-academic-access.service';
import { academicYearPermissionCodes } from './academic-year.constants';
import type {
  CreateAcademicYearDto,
  UpdateAcademicYearDto,
} from './dto/academic-year.dto';
import { AuthenticatedRequest } from 'src/shared/guards/access-token.guard';

@Injectable()
export class AcademicYearService {
  constructor(
    private readonly repository: AcademicYearRepository,
    private readonly access: MitraAcademicAccessService,
  ) {}

  async createAcademicYear(
    activeMitraId: string,
    dto: CreateAcademicYearDto,
    request: AuthenticatedRequest,
  ) {
    const actor = await this.access.ensureActor(
      request.auth.sub,
      activeMitraId,
      academicYearPermissionCodes.academicYear.create,
    );
    this.access.assertCanUseAcademicFeatures(actor);
    try {
      const created = await this.repository.createAcademicYear(
        buildCreateAcademicYear(activeMitraId, dto),
      );

      return created;
    } catch (error) {
      this.access.handlePrismaError(error);
    }
  }

  async findAcademicYears(
    activeMitraId: string,
    request: AuthenticatedRequest,
  ) {
    const actor = await this.access.ensureActor(
      request.auth.sub,
      activeMitraId,
      academicYearPermissionCodes.academicYear.view,
    );
    this.access.assertCanUseAcademicFeatures(actor);

    const items = await this.repository.findAcademicYears(activeMitraId);
    return items.map((item) => serializeAcademicYear(item));
  }

  async findAcademicYear(
    activeMitraId: string,
    id: string,
    request: AuthenticatedRequest,
  ) {
    const actor = await this.access.ensureActor(
      request.auth.sub,
      activeMitraId,
      academicYearPermissionCodes.academicYear.view,
    );
    this.access.assertCanUseAcademicFeatures(actor);
    const item = await this.ensureAcademicYear(id, activeMitraId);
    return serializeAcademicYear(item);
  }

  async updateAcademicYear(
    activeMitraId: string,
    id: string,
    dto: UpdateAcademicYearDto,
    request: AuthenticatedRequest,
  ) {
    const actor = await this.access.ensureActor(
      request.auth.sub,
      activeMitraId,
      academicYearPermissionCodes.academicYear.update,
    );
    const academicYear = await this.ensureAcademicYear(id, activeMitraId);
    this.access.assertCanUseAcademicFeatures(actor);

    try {
      const updated = await this.repository.updateAcademicYear(
        id,
        buildUpdateAcademicYear(dto, academicYear),
      );

      return serializeAcademicYear(updated);
    } catch (error) {
      this.access.handlePrismaError(error);
    }
  }

  async removeAcademicYear(
    activeMitraId: string,
    id: string,
    request: AuthenticatedRequest,
  ) {
    const actor = await this.access.ensureActor(
      request.auth.sub,
      activeMitraId,
      academicYearPermissionCodes.academicYear.remove,
    );
    await this.ensureAcademicYear(id, activeMitraId);
    this.access.assertCanUseAcademicFeatures(actor);

    await this.repository.updateAcademicYear(id, {
      status: AcademicStatus.INACTIVE,
      deletedAt: new Date(),
    });
    return { message: 'Tahun ajaran berhasil dihapus' };
  }

  async ensureAcademicYear(id: string, activeMitraId: string) {
    const item = await this.repository.findAcademicYearById(id);

    if (!item || item.deletedAt || item.mitraId !== activeMitraId) {
      throw new NotFoundException('Tahun ajaran tidak ditemukan');
    }

    return item;
  }
  async findActiveAcademicYear(activeMitraId: string) {
    const item = await this.repository.findActiveAcademicYear(activeMitraId);
    if (!item || item.deletedAt || item.mitraId !== activeMitraId) {
      throw new NotFoundException('Tahun ajaran tidak ditemukan');
    }

    return item;
  }
}
