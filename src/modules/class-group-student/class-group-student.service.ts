import { AcademicStatus } from '@prisma/client';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  buildCreateClassGroupStudent,
  buildUpdateClassGroupStudent,
  serializeClassGroupStudent,
} from './class-group-student.mapper';
import { MitraAcademicAccessService } from '../mitra-academic/shared/mitra-academic-access.service';
import { classGroupStudentPermissionCodes } from './class-group-student.constants';
import { ClassGroupStudentRepository } from './class-group-students.repository';
import type {
  ClassGroupStudentListQueryDto,
  CreateClassGroupStudentDto,
  UpdateClassGroupStudentDto,
} from './dto/class-group-student.dto';
import { AuthenticatedRequest } from 'src/shared/guards/access-token.guard';
import { ClassGroupService } from '../class-group/class-group.service';
import { MitraRole } from 'src/shared/enums/enums';

@Injectable()
export class ClassGroupStudentService {
  constructor(
    private readonly repository: ClassGroupStudentRepository,
    private readonly access: MitraAcademicAccessService,
    private readonly classGroupService: ClassGroupService,
  ) {}

  async createClassGroupStudent(
    mitraId: string,
    dto: CreateClassGroupStudentDto,
    request: AuthenticatedRequest,
  ) {
    const actor = await this.access.ensureActor(
      request.auth.sub,
      mitraId,
      classGroupStudentPermissionCodes.classGroupStudent.create,
    );

    this.access.assertCanUseAcademicFeatures(actor);

    await this.validateClassGroupStudentRelations(mitraId, {
      classGroupId: dto.classGroupId,
      studentId: dto.studentId,
      academicYearId: dto.academicYearId,
      semesterId: dto.semesterId,
    });

    try {
      const created = await this.repository.createClassGroupStudent(
        buildCreateClassGroupStudent(mitraId, dto),
      );

      return serializeClassGroupStudent(created);
    } catch (error) {
      this.access.handlePrismaError(error);
    }
  }

  async findClassGroupStudents(
    mitraId: string,
    request: AuthenticatedRequest,
    query: ClassGroupStudentListQueryDto,
  ) {
    const actor = await this.access.ensureActor(
      request.auth.sub,
      mitraId,
      classGroupStudentPermissionCodes.classGroupStudent.view,
    );

    this.access.assertCanUseAcademicFeatures(actor);

    if (query.studentId) {
      await this.access.ensureMitraRoleMember(
        query.studentId,
        mitraId,
        MitraRole.MURID,
      );
    }

    const items = await this.repository.findClassGroupStudents({
      mitraId,
      ...query,
    });

    return items.map((item) => serializeClassGroupStudent(item));
  }

  async findClassGroupStudent(
    mitraId: string,
    id: string,
    request: AuthenticatedRequest,
  ) {
    const actor = await this.access.ensureActor(
      request.auth.sub,
      mitraId,
      classGroupStudentPermissionCodes.classGroupStudent.view,
    );

    this.access.assertCanUseAcademicFeatures(actor);

    const item = await this.ensureClassGroupStudent(id, mitraId);

    return serializeClassGroupStudent(item);
  }

  async updateClassGroupStudent(
    mitraId: string,
    id: string,
    dto: UpdateClassGroupStudentDto,
    request: AuthenticatedRequest,
  ) {
    const actor = await this.access.ensureActor(
      request.auth.sub,
      mitraId,
      classGroupStudentPermissionCodes.classGroupStudent.update,
    );
    this.access.assertCanUseAcademicFeatures(actor);

    const existing = await this.ensureClassGroupStudent(id, mitraId);

    const nextClassGroupId = dto.classGroupId ?? existing.classGroupId;
    const nextStudentId = dto.studentId ?? existing.studentId;
    const nextAcademicYearId = dto.academicYearId ?? existing.academicYearId;
    const nextSemesterId = dto.semesterId ?? existing.semesterId;

    await this.validateClassGroupStudentRelations(mitraId, {
      classGroupId: nextClassGroupId,
      studentId: nextStudentId,
      academicYearId: nextAcademicYearId,
      semesterId: nextSemesterId,
    });

    try {
      const updated = await this.repository.updateClassGroupStudent(
        id,
        buildUpdateClassGroupStudent(dto, existing),
      );

      return serializeClassGroupStudent(updated);
    } catch (error) {
      this.access.handlePrismaError(error);
    }
  }

  async removeClassGroupStudent(
    mitraId: string,
    id: string,
    request: AuthenticatedRequest,
  ) {
    await this.access.ensureActor(
      request.auth.sub,
      mitraId,
      classGroupStudentPermissionCodes.classGroupStudent.remove,
    );
    await this.ensureClassGroupStudent(id, mitraId);
    await this.repository.updateClassGroupStudent(id, {
      status: AcademicStatus.INACTIVE,
      deletedAt: new Date(),
    });
    return { message: 'Relasi rombel murid berhasil dihapus' };
  }

  async ensureClassGroupStudent(id: string, mitraId: string) {
    const item = await this.repository.findClassGroupStudentById(id);

    if (!item || item.deletedAt || item.mitraId !== mitraId) {
      throw new NotFoundException('Relasi rombel murid tidak ditemukan');
    }

    return item;
  }

  private async validateClassGroupStudentRelations(
    mitraId: string,
    data: {
      classGroupId: string;
      studentId: string;
      academicYearId: string;
      semesterId: string;
    },
  ) {
    const classGroup = await this.classGroupService.ensureClassGroup(
      data.classGroupId,
      mitraId,
    );
    await this.access.ensureMitraRoleMember(
      data.studentId,
      mitraId,
      MitraRole.MURID,
    );

    if (
      classGroup.academicClass.academicYearId !== data.academicYearId ||
      classGroup.academicClass.semesterId !== data.semesterId
    ) {
      throw new ConflictException(
        'tahun ajaran dan semester rombel harus sama dengan kelas',
      );
    }
    return {
      classGroup,
      studentId: data.studentId,
      academicYearId: data.academicYearId,
      semesterId: data.semesterId,
    };
  }
}
