import { AcademicStatus } from '@prisma/client';
import { Injectable, NotFoundException } from '@nestjs/common';
import { AuthenticatedRequest } from '../../shared/guards/access-token.guard';
import {
  buildCreateClassGroup,
  buildUpdateClassGroup,
  serializeClassGroup,
} from './class-group.mapper';
import { AcademicClassRepository } from './class-group.repository';
import { MitraAcademicAccessService } from '../mitra-academic/shared/mitra-academic-access.service';
import { classGroupPermissionCodes } from './class-group.constants';
import type {
  CreateClassGroupDto,
  UpdateClassGroupDto,
} from './dto/class-group.dto';
import { AcademicClassService } from '../academic-class/academic-class.service';

@Injectable()
export class ClassGroupService {
  constructor(
    private readonly repository: AcademicClassRepository,
    private readonly access: MitraAcademicAccessService,
    private readonly academicClassService: AcademicClassService,
  ) {}

  async createClassGroup(
    mitraId: string,
    dto: CreateClassGroupDto,
    request: AuthenticatedRequest,
  ) {
    const actor = await this.access.ensureActor(
      request.auth.sub,
      mitraId,
      classGroupPermissionCodes.classGroup.create,
    );
    this.access.assertCanUseAcademicFeatures(actor);

    await this.academicClassService.ensureAcademicClass(dto.classId, mitraId);

    if (dto.waliKelasId) {
      await this.access.ensureMitraRoleMember(dto.waliKelasId, mitraId, 'GURU');
    }

    try {
      const created = await this.repository.createClassGroup(
        buildCreateClassGroup(mitraId, dto),
      );

      return serializeClassGroup(created);
    } catch (error) {
      this.access.handlePrismaError(error);
    }
  }

  async findClassGroups(mitraId: string, request: AuthenticatedRequest) {
    const actor = await this.access.ensureActor(
      request.auth.sub,
      mitraId,
      classGroupPermissionCodes.classGroup.view,
    );
    this.access.assertCanUseAcademicFeatures(actor);

    const items = await this.repository.findClassGroups(mitraId);
    return items.map((item) => serializeClassGroup(item));
  }

  async findClassGroup(
    mitraId: string,
    id: string,
    request: AuthenticatedRequest,
  ) {
    const actor = await this.access.ensureActor(
      request.auth.sub,
      mitraId,
      classGroupPermissionCodes.classGroup.view,
    );
    this.access.assertCanUseAcademicFeatures(actor);
    const item = await this.ensureClassGroup(id, mitraId);
    return serializeClassGroup(item);
  }

  async updateClassGroup(
    mitraId: string,
    id: string,
    dto: UpdateClassGroupDto,
    request: AuthenticatedRequest,
  ) {
    const actor = await this.access.ensureActor(
      request.auth.sub,
      mitraId,
      classGroupPermissionCodes.classGroup.update,
    );
    this.access.assertCanUseAcademicFeatures(actor);
    const classGroup = await this.ensureClassGroup(id, mitraId);

    if (dto.classId) {
      await this.academicClassService.ensureAcademicClass(dto.classId, mitraId);
    }

    if (dto.waliKelasId) {
      await this.access.ensureMitraRoleMember(dto.waliKelasId, mitraId, 'GURU');
    }

    try {
      const updated = await this.repository.updateClassGroup(
        id,
        buildUpdateClassGroup(dto, classGroup),
      );

      return serializeClassGroup(updated);
    } catch (error) {
      this.access.handlePrismaError(error);
    }
  }

  async removeClassGroup(
    mitraId: string,
    id: string,
    request: AuthenticatedRequest,
  ) {
    const actor = await this.access.ensureActor(
      request.auth.sub,
      mitraId,
      classGroupPermissionCodes.classGroup.remove,
    );
    this.access.assertCanUseAcademicFeatures(actor);
    await this.ensureClassGroup(id, mitraId);
    await this.repository.updateClassGroup(id, {
      status: AcademicStatus.INACTIVE,
      deletedAt: new Date(),
    });
    return { message: 'Rombel berhasil dihapus' };
  }

  async ensureClassGroup(id: string, mitraId: string) {
    const item = await this.repository.findClassGroupById(id);

    if (!item || item.deletedAt || item.mitraId !== mitraId) {
      throw new NotFoundException('Rombel tidak ditemukan');
    }

    return item;
  }

  async ensureStudentOrTeacherInClassGroup(
    classGroupId: string,
    userId: string,
  ) {
    const item = await this.repository.ensureStudentOrTeacherInClassGroup(
      classGroupId,
      userId,
    );

    if (!item) {
      throw new NotFoundException(
        'User tidak ditemukan di rombel ini, pastikan user sudah terdaftar di rombel',
      );
    }

    return {
      isTeacher: item.classGroupCourses.length > 0,
      isStudent: item.classGroupStudents.length > 0,
    };
  }
}
