import { AcademicStatus } from '@prisma/client';
import { ConflictException, Injectable } from '@nestjs/common';
import type { AuthPayload } from '../../auth/auth.types';
import { serializeClassGroupCourse } from '../mitra-academic.mapper';
import { MitraAcademicRepository } from '../mitra-academic.repository';
import { MitraAcademicAccessService } from '../shared/mitra-academic-access.service';
import { mitraAcademicPermissionCodes } from '../shared/mitra-academic-permission.constants';
import type {
  ClassGroupCourseListQueryDto,
  CreateClassGroupCourseDto,
  UpdateClassGroupCourseDto,
} from './class-group-course.dto';

@Injectable()
export class ClassGroupCourseService {
  constructor(
    private readonly repository: MitraAcademicRepository,
    private readonly access: MitraAcademicAccessService,
  ) {}

  async createClassGroupCourse(
    mitraId: string,
    dto: CreateClassGroupCourseDto,
    auth: AuthPayload,
  ) {
    await this.access.ensureActor(
      auth.sub,
      mitraId,
      mitraAcademicPermissionCodes.classGroupCourse.create,
    );
    const classGroup = await this.access.ensureClassGroup(
      dto.classGroupId,
      mitraId,
    );
    const course = await this.access.ensureSubject(dto.courseId, mitraId);
    await this.access.ensureMitraRoleMember(dto.teacherId, mitraId, 'GURU');

    if (
      classGroup.academicClass.academicYearId !== dto.academicYearId ||
      classGroup.academicClass.semesterId !== dto.semesterId
    ) {
      throw new ConflictException(
        'tahun ajaran dan semester rombel harus sama dengan kelas',
      );
    }

    if (
      !course.curriculumId ||
      course.curriculumId !== classGroup.academicClass.curriculumId
    ) {
      throw new ConflictException(
        'Mata pelajaran harus berasal dari kurikulum yang sama dengan kelas/rombel',
      );
    }

    await Promise.all([
      this.access.ensureAcademicYear(dto.academicYearId, mitraId),
      this.access.ensureSemester(dto.semesterId, mitraId),
    ]);

    try {
      const created = await this.repository.createClassGroupCourse({
        mitra: { connect: { id: mitraId } },
        classGroup: { connect: { id: dto.classGroupId } },
        course: { connect: { id: dto.courseId } },
        teacher: { connect: { id: dto.teacherId } },
        academicYear: { connect: { id: dto.academicYearId } },
        semester: { connect: { id: dto.semesterId } },
        status: dto.status,
      });

      return serializeClassGroupCourse(created);
    } catch (error) {
      this.access.handlePrismaError(error);
    }
  }

  async findClassGroupCourses(
    mitraId: string,
    auth: AuthPayload,
    query: ClassGroupCourseListQueryDto,
  ) {
    await this.access.ensureActor(
      auth.sub,
      mitraId,
      mitraAcademicPermissionCodes.classGroupCourse.view,
    );
    if (query.teacherId) {
      await this.access.ensureMitraRoleMember(query.teacherId, mitraId, 'GURU');
    }

    const items = await this.repository.findClassGroupCourses({
      mitraId,
      ...query,
    });
    return items.map(serializeClassGroupCourse);
  }

  async findClassGroupCourse(mitraId: string, id: string, auth: AuthPayload) {
    await this.access.ensureActor(
      auth.sub,
      mitraId,
      mitraAcademicPermissionCodes.classGroupCourse.view,
    );
    const item = await this.access.ensureClassGroupCourse(id, mitraId);
    return serializeClassGroupCourse(item);
  }

  async updateClassGroupCourse(
    mitraId: string,
    id: string,
    dto: UpdateClassGroupCourseDto,
    auth: AuthPayload,
  ) {
    await this.access.ensureActor(
      auth.sub,
      mitraId,
      mitraAcademicPermissionCodes.classGroupCourse.update,
    );
    const existing = await this.access.ensureClassGroupCourse(id, mitraId);

    const nextClassGroupId = dto.classGroupId ?? existing.classGroupId;
    const nextCourseId = dto.courseId ?? existing.courseId;
    const nextTeacherId = dto.teacherId ?? existing.teacherId;
    const nextAcademicYearId = dto.academicYearId ?? existing.academicYearId;
    const nextSemesterId = dto.semesterId ?? existing.semesterId;

    const classGroup = await this.access.ensureClassGroup(
      nextClassGroupId,
      mitraId,
    );
    const course = await this.access.ensureSubject(nextCourseId, mitraId);
    await this.access.ensureMitraRoleMember(nextTeacherId, mitraId, 'GURU');

    if (
      classGroup.academicClass.academicYearId !== nextAcademicYearId ||
      classGroup.academicClass.semesterId !== nextSemesterId
    ) {
      throw new ConflictException(
        'tahun ajaran dan semester rombel harus sama dengan kelas',
      );
    }

    if (
      !course.curriculumId ||
      course.curriculumId !== classGroup.academicClass.curriculumId
    ) {
      throw new ConflictException(
        'Mata pelajaran harus berasal dari kurikulum yang sama dengan kelas/rombel',
      );
    }

    try {
      const updated = await this.repository.updateClassGroupCourse(id, {
        ...(dto.classGroupId !== undefined
          ? { classGroup: { connect: { id: dto.classGroupId } } }
          : {}),
        ...(dto.courseId !== undefined
          ? { course: { connect: { id: dto.courseId } } }
          : {}),
        ...(dto.teacherId !== undefined
          ? { teacher: { connect: { id: dto.teacherId } } }
          : {}),
        ...(dto.academicYearId !== undefined
          ? { academicYear: { connect: { id: dto.academicYearId } } }
          : {}),
        ...(dto.semesterId !== undefined
          ? { semester: { connect: { id: dto.semesterId } } }
          : {}),
        ...(dto.status !== undefined ? { status: dto.status } : {}),
      });

      return serializeClassGroupCourse(updated);
    } catch (error) {
      this.access.handlePrismaError(error);
    }
  }

  async removeClassGroupCourse(mitraId: string, id: string, auth: AuthPayload) {
    await this.access.ensureActor(
      auth.sub,
      mitraId,
      mitraAcademicPermissionCodes.classGroupCourse.remove,
    );
    await this.access.ensureClassGroupCourse(id, mitraId);
    await this.repository.updateClassGroupCourse(id, {
      status: AcademicStatus.INACTIVE,
      deletedAt: new Date(),
    });
    return { message: 'Relasi rombel mapel berhasil dihapus' };
  }
}
