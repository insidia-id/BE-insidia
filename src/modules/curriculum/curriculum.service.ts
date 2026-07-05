import { AcademicStatus } from '@prisma/client';
import { Injectable, NotFoundException } from '@nestjs/common';
import {
  buildCreateCurriculum,
  serializeCurriculum,
} from './curriculum.mapper';
import { MitraAcademicAccessService } from '../mitra-academic/shared/mitra-academic-access.service';
import { curriculumPermissionCodes } from './curriculum.constants';
import type {
  CreateCurriculumDto,
  UpdateCurriculumDto,
} from './dto/curriculum.dto';
import { CurriculumRepository } from './curriculum.repository';
import { AuthenticatedRequest } from 'src/shared/guards/access-token.guard';
@Injectable()
export class CurriculumService {
  constructor(
    private readonly repository: CurriculumRepository,
    private readonly access: MitraAcademicAccessService,
  ) {}

  async createCurriculum(
    mitraId: string,
    dto: CreateCurriculumDto,
    request: AuthenticatedRequest,
  ) {
    const actor = await this.access.ensureActor(
      request.auth.sub,
      mitraId,
      curriculumPermissionCodes.curriculum.create,
    );
    this.access.assertCanUseAcademicFeatures(actor);

    try {
      const created = await this.repository.createCurriculum(
        buildCreateCurriculum(mitraId, dto),
      );

      return serializeCurriculum(created);
    } catch (error) {
      this.access.handlePrismaError(error);
    }
  }

  async findCurricula(mitraId: string, request: AuthenticatedRequest) {
    const actor = await this.access.ensureActor(
      request.auth.sub,
      mitraId,
      curriculumPermissionCodes.curriculum.view,
    );
    this.access.assertCanUseAcademicFeatures(actor);
    const items = await this.repository.findCurricula(mitraId);
    const curricula = items.map((item) => serializeCurriculum(item));
    return curricula;
  }

  async findCurriculum(
    mitraId: string,
    id: string,
    request: AuthenticatedRequest,
  ) {
    const actor = await this.access.ensureActor(
      request.auth.sub,
      mitraId,
      curriculumPermissionCodes.curriculum.view,
    );
    this.access.assertCanUseAcademicFeatures(actor);
    const item = await this.ensureCurriculum(id, mitraId);
    return serializeCurriculum(item);
  }

  async updateCurriculum(
    mitraId: string,
    id: string,
    dto: UpdateCurriculumDto,
    request: AuthenticatedRequest,
  ) {
    const actor = await this.access.ensureActor(
      request.auth.sub,
      mitraId,
      curriculumPermissionCodes.curriculum.update,
    );
    this.access.assertCanUseAcademicFeatures(actor);
    await this.ensureCurriculum(id, mitraId);

    try {
      const updated = await this.repository.updateCurriculum(id, {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.code !== undefined ? { code: dto.code ?? null } : {}),
        ...(dto.description !== undefined
          ? { description: dto.description ?? null }
          : {}),
        ...(dto.status !== undefined ? { status: dto.status } : {}),
      });

      return serializeCurriculum(updated);
    } catch (error) {
      this.access.handlePrismaError(error);
    }
  }

  async removeCurriculum(
    mitraId: string,
    id: string,
    request: AuthenticatedRequest,
  ) {
    const actor = await this.access.ensureActor(
      request.auth.sub,
      mitraId,
      curriculumPermissionCodes.curriculum.remove,
    );
    this.access.assertCanUseAcademicFeatures(actor);
    await this.ensureCurriculum(id, mitraId);
    await this.repository.updateCurriculum(id, {
      status: AcademicStatus.INACTIVE,
      deletedAt: new Date(),
    });
    return { message: 'Kurikulum berhasil dihapus' };
  }
  async ensureCurriculum(id: string, mitraId: string) {
    const item = await this.repository.findCurriculumById(id);

    if (!item || item.deletedAt || item.mitraId !== mitraId) {
      throw new NotFoundException('Kurikulum tidak ditemukan');
    }

    return item;
  }
}
