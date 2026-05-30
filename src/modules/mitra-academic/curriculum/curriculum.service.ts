import { AcademicStatus } from '@prisma/client';
import { Injectable } from '@nestjs/common';
import type { AuthPayload } from '../../auth/auth.types';
import { serializeCurriculum } from '../mitra-academic.mapper';
import { MitraAcademicAccessService } from '../shared/mitra-academic-access.service';
import { mitraAcademicPermissionCodes } from '../shared/mitra-academic-permission.constants';
import type {
  CreateCurriculumDto,
  UpdateCurriculumDto,
} from './curriculum.dto';
import { CurriculumRepository } from './curriculum.repository';

@Injectable()
export class CurriculumService {
  constructor(
    private readonly repository: CurriculumRepository,
    private readonly access: MitraAcademicAccessService,
  ) {}

  async createCurriculum(
    mitraId: string,
    dto: CreateCurriculumDto,
    auth: AuthPayload,
  ) {
    await this.access.ensureActor(
      auth.sub,
      mitraId,
      mitraAcademicPermissionCodes.curriculum.create,
    );

    try {
      const created = await this.repository.createCurriculum({
        mitra: { connect: { id: mitraId } },
        name: dto.name,
        code: dto.code ?? null,
        description: dto.description ?? null,
        status: dto.status,
      });

      return serializeCurriculum(created);
    } catch (error) {
      this.access.handlePrismaError(error);
    }
  }

  async findCurricula(mitraId: string, auth: AuthPayload) {
    await this.access.ensureActor(
      auth.sub,
      mitraId,
      mitraAcademicPermissionCodes.curriculum.view,
    );
    const items = await this.repository.findCurricula(mitraId);
    return items.map(serializeCurriculum);
  }

  async findCurriculum(mitraId: string, id: string, auth: AuthPayload) {
    await this.access.ensureActor(
      auth.sub,
      mitraId,
      mitraAcademicPermissionCodes.curriculum.view,
    );
    const item = await this.access.ensureCurriculum(id, mitraId);
    return serializeCurriculum(item);
  }

  async updateCurriculum(
    mitraId: string,
    id: string,
    dto: UpdateCurriculumDto,
    auth: AuthPayload,
  ) {
    await this.access.ensureActor(
      auth.sub,
      mitraId,
      mitraAcademicPermissionCodes.curriculum.update,
    );
    await this.access.ensureCurriculum(id, mitraId);

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

  async removeCurriculum(mitraId: string, id: string, auth: AuthPayload) {
    await this.access.ensureActor(
      auth.sub,
      mitraId,
      mitraAcademicPermissionCodes.curriculum.remove,
    );
    await this.access.ensureCurriculum(id, mitraId);
    await this.repository.updateCurriculum(id, {
      status: AcademicStatus.INACTIVE,
      deletedAt: new Date(),
    });
    return { message: 'Kurikulum berhasil dihapus' };
  }
}
