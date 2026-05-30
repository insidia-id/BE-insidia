import { Injectable } from '@nestjs/common';
import { AcademicStatus, Prisma, RoleScope } from '@prisma/client';
import type { AuthPayload } from '../../auth/auth.types';
import { serializeSubject } from '../mitra-academic.mapper';
import { MitraAcademicRepository } from '../mitra-academic.repository';
import { MitraAcademicAccessService } from '../shared/mitra-academic-access.service';
import { mitraAcademicPermissionCodes } from '../shared/mitra-academic-permission.constants';
import type { CreateSubjectDto, UpdateSubjectDto } from './subject.dto';

@Injectable()
export class SubjectService {
  constructor(
    private readonly repository: MitraAcademicRepository,
    private readonly access: MitraAcademicAccessService,
  ) {}

  async createSubject(
    mitraId: string,
    dto: CreateSubjectDto,
    auth: AuthPayload,
  ) {
    await this.access.ensureAcademicManager(
      auth.sub,
      mitraId,
      mitraAcademicPermissionCodes.subject.create,
    );
    const [mitra, curriculum] = await Promise.all([
      this.access.ensureMitraExists(mitraId),
      this.access.ensureCurriculum(dto.curriculumId, mitraId),
    ]);

    const slug = await this.access.generateSubjectSlug(
      mitra.slug,
      dto.code,
      dto.name,
    );

    try {
      const created = await this.repository.createSubject({
        creator: { connect: { id: auth.sub } },
        mitra: { connect: { id: mitraId } },
        curriculum: { connect: { id: curriculum.id } },
        title: dto.name,
        slug,
        code: dto.code,
        description: dto.description ?? null,
        status: 'PUBLISHED',
        academicStatus: dto.status,
        scope: RoleScope.MITRA,
        level: 'ALL_LEVEL',
        language: 'id',
        price: new Prisma.Decimal(0),
        isFree: true,
        requirements: [],
        outcomes: [],
        targetUsers: [],
      });

      return serializeSubject(created);
    } catch (error) {
      this.access.handlePrismaError(error);
    }
  }

  async findSubjects(mitraId: string, auth: AuthPayload) {
    await this.access.ensureAcademicManager(
      auth.sub,
      mitraId,
      mitraAcademicPermissionCodes.subject.view,
    );
    const items = await this.repository.findSubjects(mitraId);
    return items.map(serializeSubject);
  }

  async findSubject(mitraId: string, id: string, auth: AuthPayload) {
    await this.access.ensureAcademicManager(
      auth.sub,
      mitraId,
      mitraAcademicPermissionCodes.subject.view,
    );
    const item = await this.access.ensureSubject(id, mitraId);
    return serializeSubject(item);
  }

  async updateSubject(
    mitraId: string,
    id: string,
    dto: UpdateSubjectDto,
    auth: AuthPayload,
  ) {
    await this.access.ensureAcademicManager(
      auth.sub,
      mitraId,
      mitraAcademicPermissionCodes.subject.update,
    );
    const existing = await this.access.ensureSubject(id, mitraId);

    const nextCurriculumId = dto.curriculumId ?? existing.curriculumId;
    if (nextCurriculumId) {
      await this.access.ensureCurriculum(nextCurriculumId, mitraId);
    }

    const nextName = dto.name ?? existing.title;
    const nextCode = dto.code ?? existing.code ?? existing.title;
    const nextSlug =
      dto.name !== undefined || dto.code !== undefined
        ? await this.access.generateSubjectSlug(
            (await this.access.ensureMitraExists(mitraId)).slug,
            nextCode,
            nextName,
            existing.id,
          )
        : undefined;

    try {
      const updated = await this.repository.updateSubject(id, {
        ...(dto.curriculumId !== undefined
          ? { curriculum: { connect: { id: dto.curriculumId } } }
          : {}),
        ...(dto.name !== undefined ? { title: dto.name } : {}),
        ...(dto.code !== undefined ? { code: dto.code } : {}),
        ...(dto.description !== undefined
          ? { description: dto.description ?? null }
          : {}),
        ...(dto.status !== undefined ? { academicStatus: dto.status } : {}),
        ...(nextSlug !== undefined ? { slug: nextSlug } : {}),
      });

      return serializeSubject(updated);
    } catch (error) {
      this.access.handlePrismaError(error);
    }
  }

  async removeSubject(mitraId: string, id: string, auth: AuthPayload) {
    await this.access.ensureAcademicManager(
      auth.sub,
      mitraId,
      mitraAcademicPermissionCodes.subject.remove,
    );
    await this.access.ensureSubject(id, mitraId);
    await this.repository.updateSubject(id, {
      academicStatus: AcademicStatus.INACTIVE,
      status: 'ARCHIVED',
      deletedAt: new Date(),
    });
    return { message: 'Mata pelajaran berhasil dihapus' };
  }
}
