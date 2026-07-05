import { AcademicStatus } from '@prisma/client';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AuthenticatedRequest } from 'src/shared/guards/access-token.guard';
import {
  buildCreateClassGroupCourse,
  buildUpdateClassGroupCourse,
  serializeClassGroupCourse,
} from './class-group-course.mapper';
import { MitraAcademicAccessService } from '../mitra-academic/shared/mitra-academic-access.service';
import { classGroupCoursePermissionCodes } from './class-group-course.constants';
import type {
  ClassGroupCourseListQueryDto,
  CreateClassGroupCourseDto,
  UpdateClassGroupCourseDto,
} from './dto/class-group-course.dto';
import { ClassGroupCourseRepository } from './class-group-course.repository';
import { CourseService } from '../course/course.service';
import { MitraRole } from 'src/shared/enums/enums';
import { courseMitraDetailSelect } from '../course/course.constants';
import { ClassGroupService } from '../class-group/class-group.service';
@Injectable()
export class ClassGroupCourseService {
  constructor(
    private readonly repository: ClassGroupCourseRepository,
    private readonly access: MitraAcademicAccessService,
    private readonly classGroupService: ClassGroupService,
    private readonly courseService: CourseService,
  ) {}

  async createClassGroupCourse(
    activeMitraId: string,
    dto: CreateClassGroupCourseDto,
    request: AuthenticatedRequest,
  ) {
    await this.access.ensureActor(
      request.auth.sub,
      activeMitraId,
      classGroupCoursePermissionCodes.classGroupCourse.create,
    );

    await this.validateClassGroupCourseRelations(activeMitraId, {
      classGroupId: dto.classGroupId,
      courseMitraId: dto.courseMitraId,
      teacherId: dto.teacherId,
      academicYearId: dto.academicYearId,
      semesterId: dto.semesterId,
    });

    try {
      const created = await this.repository.createClassGroupCourse(
        buildCreateClassGroupCourse(activeMitraId, dto),
      );

      return created;
    } catch (error) {
      this.access.handlePrismaError(error);
    }
  }

  async findClassGroupCourses(
    activeMitraId: string,
    request: AuthenticatedRequest,
    query: ClassGroupCourseListQueryDto,
  ) {
    await this.access.ensureActor(
      request.auth.sub,
      activeMitraId,
      classGroupCoursePermissionCodes.classGroupCourse.view,
    );

    if (query.teacherId) {
      await this.access.ensureMitraRoleMember(
        query.teacherId,
        activeMitraId,
        MitraRole.GURU,
      );
    }

    const items = await this.repository.findClassGroupCourses({
      mitraId: activeMitraId,
      ...query,
    });

    return items.map((item) => serializeClassGroupCourse(item));
  }

  async findClassGroupCourse(
    activeMitraId: string,
    id: string,
    request: AuthenticatedRequest,
  ) {
    await this.access.ensureActor(
      request.auth.sub,
      activeMitraId,
      classGroupCoursePermissionCodes.classGroupCourse.view,
    );
    const item = await this.ensureClassGroupCourse(id, activeMitraId);
    return serializeClassGroupCourse(item);
  }

  async updateClassGroupCourse(
    activeMitraId: string,
    id: string,
    dto: UpdateClassGroupCourseDto,
    request: AuthenticatedRequest,
  ) {
    await this.access.ensureActor(
      request.auth.sub,
      activeMitraId,
      classGroupCoursePermissionCodes.classGroupCourse.update,
    );
    const existing = await this.ensureClassGroupCourse(id, activeMitraId);

    const nextClassGroupId = dto.classGroupId ?? existing.classGroupId;
    const nextCourseMitraId = dto.courseMitraId ?? existing.courseMitraId;
    const nextTeacherId = dto.teacherId ?? existing.teacherId;
    const nextAcademicYearId = dto.academicYearId ?? existing.academicYearId;
    const nextSemesterId = dto.semesterId ?? existing.semesterId;

    await this.validateClassGroupCourseRelations(activeMitraId, {
      classGroupId: nextClassGroupId,
      courseMitraId: nextCourseMitraId,
      teacherId: nextTeacherId,
      academicYearId: nextAcademicYearId,
      semesterId: nextSemesterId,
    });

    try {
      const updated = await this.repository.updateClassGroupCourse(
        id,
        buildUpdateClassGroupCourse(dto, existing),
      );

      return serializeClassGroupCourse(updated);
    } catch (error) {
      this.access.handlePrismaError(error);
    }
  }

  async removeClassGroupCourse(
    activeMitraId: string,
    id: string,
    request: AuthenticatedRequest,
  ) {
    await this.access.ensureActor(
      request.auth.sub,
      activeMitraId,
      classGroupCoursePermissionCodes.classGroupCourse.remove,
    );
    await this.ensureClassGroupCourse(id, activeMitraId);
    await this.repository.updateClassGroupCourse(id, {
      status: AcademicStatus.INACTIVE,
      deletedAt: new Date(),
    });
    return { message: 'Relasi rombel mapel berhasil dihapus' };
  }

  async ensureClassGroupCourse(id: string, mitraId: string) {
    const item = await this.repository.findClassGroupCourseById(id);

    if (!item || item.deletedAt || item.mitraId !== mitraId) {
      throw new NotFoundException('Relasi rombel mapel tidak ditemukan');
    }

    return item;
  }

  private async validateClassGroupCourseRelations(
    activeMitraId: string,
    data: {
      classGroupId: string;
      courseMitraId: string | null;
      teacherId: string;
      academicYearId: string;
      semesterId: string;
    },
  ) {
    const classGroup = await this.classGroupService.ensureClassGroup(
      data.classGroupId,
      activeMitraId,
    );

    const course = await this.courseService.ensureCourseExists(
      data.courseMitraId!,
      courseMitraDetailSelect,
    );

    await this.access.ensureMitraRoleMember(
      data.teacherId,
      activeMitraId,
      MitraRole.GURU,
    );

    if (
      classGroup.academicClass.academicYearId !== data.academicYearId ||
      classGroup.academicClass.semesterId !== data.semesterId
    ) {
      throw new ConflictException(
        'tahun ajaran dan semester rombel harus sama dengan kelas',
      );
    }

    if (
      !course.mitra?.curriculum?.id ||
      course.mitra?.curriculum?.id !== classGroup.academicClass.curriculumId
    ) {
      throw new ConflictException(
        'Mata pelajaran harus berasal dari kurikulum yang sama dengan kelas/rombel',
      );
    }
    return { classGroup, course };
  }
}
