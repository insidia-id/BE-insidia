import { Injectable } from '@nestjs/common';
import type { AuthPayload } from '../../auth/auth.types';
import {
  serializeClassGroup,
  serializeClassGroupCourse,
  serializeClassGroupStudent,
  serializeSubject,
} from '../mitra-academic.mapper';
import { MitraAcademicRepository } from '../mitra-academic.repository';
import { LearningMaterialService } from '../learning-material/learning-material.service';
import { MitraAcademicAccessService } from '../shared/mitra-academic-access.service';
import {
  matchesAcademicClassTerm,
  toAcademicTermParams,
} from '../shared/mitra-academic-query.helper';
import { mitraAcademicPermissionCodes } from '../shared/mitra-academic-permission.constants';
import type { LearningMaterialListQueryDto } from '../learning-material/learning-material.dto';

@Injectable()
export class MyAcademicService {
  constructor(
    private readonly repository: MitraAcademicRepository,
    private readonly access: MitraAcademicAccessService,
    private readonly learningMaterialService: LearningMaterialService,
  ) {}

  async findMyClasses(
    mitraId: string,
    auth: AuthPayload,
    query: LearningMaterialListQueryDto,
  ) {
    const actor = await this.access.ensureMitraAccess(
      auth.sub,
      mitraId,
      mitraAcademicPermissionCodes.classGroup.view,
    );

    const term = await this.access.resolveDefaultTerm(mitraId, query);
    const termParams = toAcademicTermParams(term);

    if (actor.isSuperAdmin || actor.mitraRoleCode === 'AKADEMIK') {
      const items = await this.repository.findClassGroups(mitraId);
      return items
        .filter((item) => matchesAcademicClassTerm(item, term))
        .map(serializeClassGroup);
    }

    if (actor.mitraRoleCode === 'GURU') {
      const items = await this.repository.findTeacherClassGroups({
        mitraId,
        teacherId: auth.sub,
        ...termParams,
      });
      return items.map(serializeClassGroupCourse);
    }

    this.access.assertCanUseStudentFeatures(actor);
    const items = await this.repository.findStudentClassGroups({
      mitraId,
      studentId: auth.sub,
      ...termParams,
    });
    return items.map(serializeClassGroupStudent);
  }

  async findMySubjects(
    mitraId: string,
    auth: AuthPayload,
    query: LearningMaterialListQueryDto,
  ) {
    const actor = await this.access.ensureMitraAccess(
      auth.sub,
      mitraId,
      mitraAcademicPermissionCodes.subject.view,
    );
    const term = await this.access.resolveDefaultTerm(mitraId, query);
    const termParams = toAcademicTermParams(term);

    if (actor.isSuperAdmin || actor.mitraRoleCode === 'AKADEMIK') {
      const items = await this.repository.findSubjects(mitraId);
      return items.map(serializeSubject);
    }

    if (actor.mitraRoleCode === 'GURU') {
      const items = await this.repository.findTeacherSubjects({
        mitraId,
        teacherId: auth.sub,
        ...termParams,
      });
      return items.map(serializeSubject);
    }

    this.access.assertCanUseStudentFeatures(actor);
    const items = await this.repository.findStudentSubjects({
      mitraId,
      studentId: auth.sub,
      ...termParams,
    });
    return items.map(serializeSubject);
  }

  async findMyLearningMaterials(
    mitraId: string,
    auth: AuthPayload,
    query: LearningMaterialListQueryDto,
  ) {
    return this.learningMaterialService.findLearningMaterials(
      mitraId,
      auth,
      query,
    );
  }
}
