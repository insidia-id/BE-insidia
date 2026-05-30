import { AcademicStatus } from '@prisma/client';
import { Injectable } from '@nestjs/common';
import type { AuthPayload } from '../../auth/auth.types';
import { serializeAcademicYear } from '../mitra-academic.mapper';
import { MitraAcademicRepository } from '../mitra-academic.repository';
import { MitraAcademicAccessService } from '../shared/mitra-academic-access.service';
import { mitraAcademicPermissionCodes } from '../shared/mitra-academic-permission.constants';
import type {
  CreateAcademicYearDto,
  UpdateAcademicYearDto,
} from './academic-year.dto';

@Injectable()
export class AcademicYearService {
  constructor(
    private readonly repository: MitraAcademicRepository,
    private readonly access: MitraAcademicAccessService,
  ) {}

  async createAcademicYear(
    mitraId: string,
    dto: CreateAcademicYearDto,
    auth: AuthPayload,
  ) {
    await this.access.ensureActor(
      auth.sub,
      mitraId,
      mitraAcademicPermissionCodes.academicYear.create,
    );

    try {
      const created = await this.repository.createAcademicYear({
        mitra: { connect: { id: mitraId } },
        name: dto.name,
        startDate: dto.startDate,
        endDate: dto.endDate,
        status: dto.status,
      });

      return serializeAcademicYear(created);
    } catch (error) {
      this.access.handlePrismaError(error);
    }
  }

  async findAcademicYears(mitraId: string, auth: AuthPayload) {
    await this.access.ensureActor(
      auth.sub,
      mitraId,
      mitraAcademicPermissionCodes.academicYear.view,
    );

    const items = await this.repository.findAcademicYears(mitraId);
    return items.map(serializeAcademicYear);
  }

  async findAcademicYear(mitraId: string, id: string, auth: AuthPayload) {
    await this.access.ensureActor(
      auth.sub,
      mitraId,
      mitraAcademicPermissionCodes.academicYear.view,
    );
    const item = await this.access.ensureAcademicYear(id, mitraId);
    return serializeAcademicYear(item);
  }

  async updateAcademicYear(
    mitraId: string,
    id: string,
    dto: UpdateAcademicYearDto,
    auth: AuthPayload,
  ) {
    await this.access.ensureActor(
      auth.sub,
      mitraId,
      mitraAcademicPermissionCodes.academicYear.update,
    );
    await this.access.ensureAcademicYear(id, mitraId);

    try {
      const updated = await this.repository.updateAcademicYear(id, {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.startDate !== undefined ? { startDate: dto.startDate } : {}),
        ...(dto.endDate !== undefined ? { endDate: dto.endDate } : {}),
        ...(dto.status !== undefined ? { status: dto.status } : {}),
      });

      return serializeAcademicYear(updated);
    } catch (error) {
      this.access.handlePrismaError(error);
    }
  }

  async removeAcademicYear(mitraId: string, id: string, auth: AuthPayload) {
    await this.access.ensureActor(
      auth.sub,
      mitraId,
      mitraAcademicPermissionCodes.academicYear.remove,
    );
    await this.access.ensureAcademicYear(id, mitraId);
    await this.repository.updateAcademicYear(id, {
      status: AcademicStatus.INACTIVE,
      deletedAt: new Date(),
    });
    return { message: 'Tahun ajaran berhasil dihapus' };
  }
}
