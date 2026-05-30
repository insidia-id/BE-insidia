import { AcademicStatus } from '@prisma/client';
import { Injectable } from '@nestjs/common';
import type { AuthPayload } from '../../auth/auth.types';
import { serializeClassGroup } from '../mitra-academic.mapper';
import { MitraAcademicRepository } from '../mitra-academic.repository';
import { MitraAcademicAccessService } from '../shared/mitra-academic-access.service';
import { mitraAcademicPermissionCodes } from '../shared/mitra-academic-permission.constants';
import type {
  CreateClassGroupDto,
  UpdateClassGroupDto,
} from './class-group.dto';

@Injectable()
export class ClassGroupService {
  constructor(
    private readonly repository: MitraAcademicRepository,
    private readonly access: MitraAcademicAccessService,
  ) {}

  async createClassGroup(
    mitraId: string,
    dto: CreateClassGroupDto,
    auth: AuthPayload,
  ) {
    await this.access.ensureActor(
      auth.sub,
      mitraId,
      mitraAcademicPermissionCodes.classGroup.create,
    );
    await this.access.ensureAcademicClass(dto.classId, mitraId);

    if (dto.waliKelasId) {
      await this.access.ensureMitraRoleMember(dto.waliKelasId, mitraId, 'GURU');
    }

    try {
      const created = await this.repository.createClassGroup({
        mitra: { connect: { id: mitraId } },
        academicClass: { connect: { id: dto.classId } },
        name: dto.name,
        waliKelas: dto.waliKelasId
          ? { connect: { id: dto.waliKelasId } }
          : undefined,
        status: dto.status,
      });

      return serializeClassGroup(created);
    } catch (error) {
      this.access.handlePrismaError(error);
    }
  }

  async findClassGroups(mitraId: string, auth: AuthPayload) {
    await this.access.ensureActor(
      auth.sub,
      mitraId,
      mitraAcademicPermissionCodes.classGroup.view,
    );
    const items = await this.repository.findClassGroups(mitraId);
    return items.map(serializeClassGroup);
  }

  async findClassGroup(mitraId: string, id: string, auth: AuthPayload) {
    await this.access.ensureActor(
      auth.sub,
      mitraId,
      mitraAcademicPermissionCodes.classGroup.view,
    );
    const item = await this.access.ensureClassGroup(id, mitraId);
    return serializeClassGroup(item);
  }

  async updateClassGroup(
    mitraId: string,
    id: string,
    dto: UpdateClassGroupDto,
    auth: AuthPayload,
  ) {
    await this.access.ensureActor(
      auth.sub,
      mitraId,
      mitraAcademicPermissionCodes.classGroup.update,
    );
    await this.access.ensureClassGroup(id, mitraId);

    if (dto.classId) {
      await this.access.ensureAcademicClass(dto.classId, mitraId);
    }

    if (dto.waliKelasId) {
      await this.access.ensureMitraRoleMember(dto.waliKelasId, mitraId, 'GURU');
    }

    try {
      const updated = await this.repository.updateClassGroup(id, {
        ...(dto.classId !== undefined
          ? { academicClass: { connect: { id: dto.classId } } }
          : {}),
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.waliKelasId !== undefined
          ? dto.waliKelasId === null
            ? { waliKelas: { disconnect: true } }
            : { waliKelas: { connect: { id: dto.waliKelasId } } }
          : {}),
        ...(dto.status !== undefined ? { status: dto.status } : {}),
      });

      return serializeClassGroup(updated);
    } catch (error) {
      this.access.handlePrismaError(error);
    }
  }

  async removeClassGroup(mitraId: string, id: string, auth: AuthPayload) {
    await this.access.ensureActor(
      auth.sub,
      mitraId,
      mitraAcademicPermissionCodes.classGroup.remove,
    );
    await this.access.ensureClassGroup(id, mitraId);
    await this.repository.updateClassGroup(id, {
      status: AcademicStatus.INACTIVE,
      deletedAt: new Date(),
    });
    return { message: 'Rombel berhasil dihapus' };
  }
}
