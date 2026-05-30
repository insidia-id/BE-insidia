import { AcademicStatus } from '@prisma/client';
import { ForbiddenException, Injectable } from '@nestjs/common';
import type { AuthPayload } from '../../auth/auth.types';
import { serializeLearningMaterial } from '../mitra-academic.mapper';
import { MitraAcademicRepository } from '../mitra-academic.repository';
import { MitraAcademicAccessService } from '../shared/mitra-academic-access.service';
import { mitraAcademicPermissionCodes } from '../shared/mitra-academic-permission.constants';
import { toAcademicTermParams } from '../shared/mitra-academic-query.helper';
import type { UploadedMaterialFile } from './material.types';
import type {
  CreateLearningMaterialDto,
  LearningMaterialListQueryDto,
  UpdateLearningMaterialDto,
} from './learning-material.dto';

@Injectable()
export class LearningMaterialService {
  constructor(
    private readonly repository: MitraAcademicRepository,
    private readonly access: MitraAcademicAccessService,
  ) {}

  async createLearningMaterial(
    mitraId: string,
    dto: CreateLearningMaterialDto,
    fileInput: UploadedMaterialFile | undefined,
    auth: AuthPayload,
  ) {
    await this.access.ensureTeacherAccess(
      auth.sub,
      mitraId,
      mitraAcademicPermissionCodes.learningMaterial.create,
    );

    const file = this.access.assertPdfFile(fileInput);
    const classGroup = await this.access.ensureClassGroup(
      dto.classGroupId,
      mitraId,
    );
    await this.access.ensureSubject(dto.courseId, mitraId);

    const assignment = await this.repository.findTeacherAssignment({
      mitraId,
      classGroupId: dto.classGroupId,
      courseId: dto.courseId,
      teacherId: auth.sub,
      academicYearId: classGroup.academicClass.academicYearId,
      semesterId: classGroup.academicClass.semesterId,
    });

    if (!assignment) {
      throw new ForbiddenException(
        'Guru hanya bisa upload materi untuk rombel dan mapel yang dia ampu',
      );
    }

    const stored = await this.access.storeMaterialFile(mitraId, file);

    try {
      const created = await this.repository.createLearningMaterial({
        mitra: { connect: { id: mitraId } },
        classGroup: { connect: { id: dto.classGroupId } },
        course: { connect: { id: dto.courseId } },
        teacher: { connect: { id: auth.sub } },
        title: dto.title,
        description: dto.description ?? null,
        filePath: stored.relativePath,
        fileType: file.mimetype,
        fileSize: file.size,
        status: AcademicStatus.ACTIVE,
      });

      return serializeLearningMaterial(created);
    } catch (error) {
      await this.access.deleteStoredFile(stored.absolutePath);
      this.access.handlePrismaError(error);
    }
  }

  async findLearningMaterials(
    mitraId: string,
    auth: AuthPayload,
    query: LearningMaterialListQueryDto,
  ) {
    const actor = await this.access.ensureMaterialViewerAccess(
      auth.sub,
      mitraId,
      mitraAcademicPermissionCodes.learningMaterial.view,
    );

    const term = await this.access.resolveDefaultTerm(mitraId, query);
    const termParams = toAcademicTermParams(term);

    if (actor.isSuperAdmin || actor.mitraRoleCode === 'AKADEMIK') {
      const items = await this.repository.findLearningMaterials({
        mitraId,
        classGroupId: query.classGroupId,
        courseId: query.courseId,
        teacherId: query.teacherId,
        ...termParams,
      });

      return items.map(serializeLearningMaterial);
    }

    if (actor.mitraRoleCode === 'GURU') {
      const items = await this.repository.findLearningMaterials({
        mitraId,
        classGroupId: query.classGroupId,
        courseId: query.courseId,
        teacherId: auth.sub,
        ...termParams,
      });

      return items.map(serializeLearningMaterial);
    }

    const items = await this.repository.findStudentAccessibleMaterials({
      mitraId,
      studentId: auth.sub,
      classGroupId: query.classGroupId,
      courseId: query.courseId,
      ...termParams,
    });

    return items.map(serializeLearningMaterial);
  }

  async findLearningMaterial(mitraId: string, id: string, auth: AuthPayload) {
    const actor = await this.access.ensureMaterialViewerAccess(
      auth.sub,
      mitraId,
      mitraAcademicPermissionCodes.learningMaterial.view,
    );
    const material = await this.access.ensureLearningMaterial(id, mitraId);

    if (actor.isSuperAdmin || actor.mitraRoleCode === 'AKADEMIK') {
      return serializeLearningMaterial(material);
    }

    if (actor.mitraRoleCode === 'GURU') {
      if (material.teacherId !== auth.sub) {
        throw new ForbiddenException(
          'Guru hanya bisa melihat materi yang dia upload',
        );
      }

      return serializeLearningMaterial(material);
    }

    const hasAccess = await this.repository.findActiveStudentMembership({
      mitraId,
      classGroupId: material.classGroupId,
      studentId: auth.sub,
      academicYearId: material.classGroup.academicClass.academicYearId,
      semesterId: material.classGroup.academicClass.semesterId,
    });

    if (!hasAccess) {
      throw new ForbiddenException('Murid tidak memiliki akses ke materi ini');
    }

    return serializeLearningMaterial(material);
  }

  async updateLearningMaterial(
    mitraId: string,
    id: string,
    dto: UpdateLearningMaterialDto,
    auth: AuthPayload,
  ) {
    const actor = await this.access.ensureTeacherAccess(
      auth.sub,
      mitraId,
      mitraAcademicPermissionCodes.learningMaterial.update,
    );
    const material = await this.access.ensureLearningMaterial(id, mitraId);

    if (!actor.isSuperAdmin && material.teacherId !== auth.sub) {
      throw new ForbiddenException(
        'Guru hanya bisa mengubah materi yang dia upload',
      );
    }

    try {
      const updated = await this.repository.updateLearningMaterial(id, {
        ...(dto.title !== undefined ? { title: dto.title } : {}),
        ...(dto.description !== undefined
          ? { description: dto.description ?? null }
          : {}),
        ...(dto.status !== undefined ? { status: dto.status } : {}),
      });

      return serializeLearningMaterial(updated);
    } catch (error) {
      this.access.handlePrismaError(error);
    }
  }

  async removeLearningMaterial(mitraId: string, id: string, auth: AuthPayload) {
    const actor = await this.access.ensureTeacherAccess(
      auth.sub,
      mitraId,
      mitraAcademicPermissionCodes.learningMaterial.remove,
    );
    const material = await this.access.ensureLearningMaterial(id, mitraId);

    if (!actor.isSuperAdmin && material.teacherId !== auth.sub) {
      throw new ForbiddenException(
        'Guru hanya bisa menghapus materi yang dia upload',
      );
    }

    await this.repository.updateLearningMaterial(id, {
      status: AcademicStatus.INACTIVE,
      deletedAt: new Date(),
    });

    await this.access.deleteStoredFile(
      this.access.resolveStoragePath(material.filePath),
    );

    return { message: 'Materi berhasil dihapus' };
  }
}
