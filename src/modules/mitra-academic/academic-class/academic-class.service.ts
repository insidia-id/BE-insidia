import { AcademicStatus } from '@prisma/client';
import { Injectable } from '@nestjs/common';
import type { AuthPayload } from '../../auth/auth.types';
import { serializeAcademicClass } from '../mitra-academic.mapper';
import { MitraAcademicRepository } from '../mitra-academic.repository';
import { MitraAcademicAccessService } from '../shared/mitra-academic-access.service';
import { mitraAcademicPermissionCodes } from '../shared/mitra-academic-permission.constants';
import type {
  CreateAcademicClassDto,
  UpdateAcademicClassDto,
} from './academic-class.dto';

@Injectable()
export class AcademicClassService {
  constructor(
    private readonly repository: MitraAcademicRepository,
    private readonly access: MitraAcademicAccessService,
  ) {}

  async createAcademicClass(
    mitraId: string,
    dto: CreateAcademicClassDto,
    auth: AuthPayload,
  ) {
    await this.access.ensureActor(
      auth.sub,
      mitraId,
      mitraAcademicPermissionCodes.academicClass.create,
    );
    await this.access.validateClassRelations(mitraId, dto);

    try {
      const created = await this.repository.createAcademicClass({
        mitra: { connect: { id: mitraId } },
        academicYear: { connect: { id: dto.academicYearId } },
        semester: { connect: { id: dto.semesterId } },
        curriculum: { connect: { id: dto.curriculumId } },
        name: dto.name,
        level: dto.level,
        status: dto.status,
      });

      return serializeAcademicClass(created);
    } catch (error) {
      this.access.handlePrismaError(error);
    }
  }

  async findAcademicClasses(mitraId: string, auth: AuthPayload) {
    await this.access.ensureActor(
      auth.sub,
      mitraId,
      mitraAcademicPermissionCodes.academicClass.view,
    );
    const items = await this.repository.findAcademicClasses(mitraId);
    return items.map(serializeAcademicClass);
  }

  async findAcademicClass(mitraId: string, id: string, auth: AuthPayload) {
    await this.access.ensureActor(
      auth.sub,
      mitraId,
      mitraAcademicPermissionCodes.academicClass.view,
    );
    const item = await this.access.ensureAcademicClass(id, mitraId);
    return serializeAcademicClass(item);
  }

  async updateAcademicClass(
    mitraId: string,
    id: string,
    dto: UpdateAcademicClassDto,
    auth: AuthPayload,
  ) {
    await this.access.ensureActor(
      auth.sub,
      mitraId,
      mitraAcademicPermissionCodes.academicClass.update,
    );
    const existing = await this.access.ensureAcademicClass(id, mitraId);

    await this.access.validateClassRelations(mitraId, {
      academicYearId: dto.academicYearId ?? existing.academicYearId,
      semesterId: dto.semesterId ?? existing.semesterId,
      curriculumId: dto.curriculumId ?? existing.curriculumId,
    });

    try {
      const updated = await this.repository.updateAcademicClass(id, {
        ...(dto.academicYearId !== undefined
          ? { academicYear: { connect: { id: dto.academicYearId } } }
          : {}),
        ...(dto.semesterId !== undefined
          ? { semester: { connect: { id: dto.semesterId } } }
          : {}),
        ...(dto.curriculumId !== undefined
          ? { curriculum: { connect: { id: dto.curriculumId } } }
          : {}),
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.level !== undefined ? { level: dto.level } : {}),
        ...(dto.status !== undefined ? { status: dto.status } : {}),
      });

      return serializeAcademicClass(updated);
    } catch (error) {
      this.access.handlePrismaError(error);
    }
  }

  async removeAcademicClass(mitraId: string, id: string, auth: AuthPayload) {
    await this.access.ensureActor(
      auth.sub,
      mitraId,
      mitraAcademicPermissionCodes.academicClass.remove,
    );
    await this.access.ensureAcademicClass(id, mitraId);
    await this.repository.updateAcademicClass(id, {
      status: AcademicStatus.INACTIVE,
      deletedAt: new Date(),
    });
    return { message: 'Kelas berhasil dihapus' };
  }
}
