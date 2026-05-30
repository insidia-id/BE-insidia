import { AcademicStatus } from '@prisma/client';
import { ConflictException, Injectable } from '@nestjs/common';
import type { AuthPayload } from '../../auth/auth.types';
import { serializeClassGroupStudent } from '../mitra-academic.mapper';
import { MitraAcademicRepository } from '../mitra-academic.repository';
import { MitraAcademicAccessService } from '../shared/mitra-academic-access.service';
import { mitraAcademicPermissionCodes } from '../shared/mitra-academic-permission.constants';
import type {
  ClassGroupStudentListQueryDto,
  CreateClassGroupStudentDto,
  UpdateClassGroupStudentDto,
} from './class-group-student.dto';

@Injectable()
export class ClassGroupStudentService {
  constructor(
    private readonly repository: MitraAcademicRepository,
    private readonly access: MitraAcademicAccessService,
  ) {}

  async createClassGroupStudent(
    mitraId: string,
    dto: CreateClassGroupStudentDto,
    auth: AuthPayload,
  ) {
    await this.access.ensureActor(
      auth.sub,
      mitraId,
      mitraAcademicPermissionCodes.classGroupStudent.create,
    );

    const classGroup = await this.access.ensureClassGroup(
      dto.classGroupId,
      mitraId,
    );

    await this.access.ensureMitraRoleMember(dto.studentId, mitraId, 'MURID');

    if (
      classGroup.academicClass.academicYearId !== dto.academicYearId ||
      classGroup.academicClass.semesterId !== dto.semesterId
    ) {
      throw new ConflictException(
        'tahun ajaran dan semester rombel harus sama dengan kelas',
      );
    }

    try {
      const created = await this.repository.createClassGroupStudent({
        mitra: { connect: { id: mitraId } },
        classGroup: { connect: { id: dto.classGroupId } },
        student: { connect: { id: dto.studentId } },
        academicYear: { connect: { id: dto.academicYearId } },
        semester: { connect: { id: dto.semesterId } },
        status: dto.status,
      });

      return serializeClassGroupStudent(created);
    } catch (error) {
      this.access.handlePrismaError(error);
    }
  }

  async findClassGroupStudents(
    mitraId: string,
    auth: AuthPayload,
    query: ClassGroupStudentListQueryDto,
  ) {
    await this.access.ensureActor(
      auth.sub,
      mitraId,
      mitraAcademicPermissionCodes.classGroupStudent.view,
    );

    if (query.studentId) {
      await this.access.ensureMitraRoleMember(
        query.studentId,
        mitraId,
        'MURID',
      );
    }

    const items = await this.repository.findClassGroupStudents({
      mitraId,
      ...query,
    });
    return items.map(serializeClassGroupStudent);
  }

  async findClassGroupStudent(mitraId: string, id: string, auth: AuthPayload) {
    await this.access.ensureActor(
      auth.sub,
      mitraId,
      mitraAcademicPermissionCodes.classGroupStudent.view,
    );
    const item = await this.access.ensureClassGroupStudent(id, mitraId);
    return serializeClassGroupStudent(item);
  }

  async updateClassGroupStudent(
    mitraId: string,
    id: string,
    dto: UpdateClassGroupStudentDto,
    auth: AuthPayload,
  ) {
    await this.access.ensureActor(
      auth.sub,
      mitraId,
      mitraAcademicPermissionCodes.classGroupStudent.update,
    );
    const existing = await this.access.ensureClassGroupStudent(id, mitraId);

    const nextClassGroupId = dto.classGroupId ?? existing.classGroupId;
    const nextStudentId = dto.studentId ?? existing.studentId;
    const nextAcademicYearId = dto.academicYearId ?? existing.academicYearId;
    const nextSemesterId = dto.semesterId ?? existing.semesterId;

    const classGroup = await this.access.ensureClassGroup(
      nextClassGroupId,
      mitraId,
    );
    await this.access.ensureMitraRoleMember(nextStudentId, mitraId, 'MURID');

    if (
      classGroup.academicClass.academicYearId !== nextAcademicYearId ||
      classGroup.academicClass.semesterId !== nextSemesterId
    ) {
      throw new ConflictException(
        'tahun ajaran dan semester rombel harus sama dengan kelas',
      );
    }

    try {
      const updated = await this.repository.updateClassGroupStudent(id, {
        ...(dto.classGroupId !== undefined
          ? { classGroup: { connect: { id: dto.classGroupId } } }
          : {}),
        ...(dto.studentId !== undefined
          ? { student: { connect: { id: dto.studentId } } }
          : {}),
        ...(dto.academicYearId !== undefined
          ? { academicYear: { connect: { id: dto.academicYearId } } }
          : {}),
        ...(dto.semesterId !== undefined
          ? { semester: { connect: { id: dto.semesterId } } }
          : {}),
        ...(dto.status !== undefined ? { status: dto.status } : {}),
      });

      return serializeClassGroupStudent(updated);
    } catch (error) {
      this.access.handlePrismaError(error);
    }
  }

  async removeClassGroupStudent(
    mitraId: string,
    id: string,
    auth: AuthPayload,
  ) {
    await this.access.ensureActor(
      auth.sub,
      mitraId,
      mitraAcademicPermissionCodes.classGroupStudent.remove,
    );
    await this.access.ensureClassGroupStudent(id, mitraId);
    await this.repository.updateClassGroupStudent(id, {
      status: AcademicStatus.INACTIVE,
      deletedAt: new Date(),
    });
    return { message: 'Relasi rombel murid berhasil dihapus' };
  }
}
