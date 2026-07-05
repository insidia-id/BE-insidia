import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AuthenticatedRequest } from 'src/shared/guards/access-token.guard';
import { MitraAcademicAccessService } from '../mitra-academic/shared/mitra-academic-access.service';
import { toAcademicTermParams } from './my-academic.helper';
import type { MyAcademicQueryDto } from './dto/my-academic.dto';
import { MitraAcademicTerm } from './my-academic.types';
import { MyAcademicRepository } from './my-academic.repository';
import {
  serializeMyClassesGroupsCourse,
  serializeMyClassesGroupsStudent,
  serializeMyCourseTeacher,
  serializeMyCourseStudent,
} from './my-academic.mapper';
import { MyAcademicPermissionCodes } from './my-academic.constants';
import { AcademicYearService } from '../academic-year/academic-year.service';
import { SemesterService } from '../semester/semester.service';
@Injectable()
export class MyAcademicService {
  constructor(
    private readonly repository: MyAcademicRepository,
    private readonly access: MitraAcademicAccessService,
    private readonly AcademicYearService: AcademicYearService,
    private readonly SemesterService: SemesterService,
  ) {}

  async findMyClasses(
    mitraId: string,
    request: AuthenticatedRequest,
    query: MyAcademicQueryDto,
  ) {
    const actor = await this.access.ensureActor(
      request.auth.sub,
      mitraId,
      MyAcademicPermissionCodes.myClassGroup.view,
    );

    const term = await this.resolveDefaultTerm(mitraId, query);
    const termParams = toAcademicTermParams(term);

    if (actor.mitraRoleCode?.find((code) => code === 'GURU')) {
      const items = await this.repository.findTeacherClassGroups({
        mitraId,
        teacherId: request.auth.sub,
        ...termParams,
      });
      return items.map((item) => serializeMyClassesGroupsCourse(item));
    }

    this.access.assertCanUseStudentFeatures(actor);
    const items = await this.repository.findStudentClassGroups({
      mitraId,
      studentId: request.auth.sub,
      ...termParams,
    });
    return items.map((item) => serializeMyClassesGroupsStudent(item));
  }

  async findMySubjects(
    mitraId: string,
    request: AuthenticatedRequest,
    query: MyAcademicQueryDto,
  ) {
    const actor = await this.access.ensureActor(
      request.auth.sub,
      mitraId,
      MyAcademicPermissionCodes.myClassCourse.view,
    );
    const term = await this.resolveDefaultTerm(mitraId, query);
    const termParams = toAcademicTermParams(term);

    if (actor.mitraRoleCode?.find((code) => code === 'GURU')) {
      const items = await this.repository.findTeacherCourses({
        mitraId,
        teacherId: request.auth.sub,
        ...termParams,
      });
      return items.map((item) => serializeMyCourseTeacher(item));
    }

    this.access.assertCanUseStudentFeatures(actor);
    const items = await this.repository.findStudentCourses({
      mitraId,
      studentId: request.auth.sub,
      ...termParams,
    });
    return items.map((item) => serializeMyCourseStudent(item));
  }

  async resolveDefaultTerm(mitraId: string, query: MitraAcademicTerm) {
    if (query.academicYearId && query.semesterId) {
      const [academicYear, semester] = await Promise.all([
        this.AcademicYearService.ensureAcademicYear(
          query.academicYearId,
          mitraId,
        ),
        this.SemesterService.ensureSemester(query.semesterId, mitraId),
      ]);

      if (semester.academicYearId !== academicYear.id) {
        throw new ConflictException(
          'semester harus berada dalam tahun ajaran yang sama',
        );
      }

      return query;
    }

    if (query.academicYearId && !query.semesterId) {
      await this.AcademicYearService.ensureAcademicYear(
        query.academicYearId,
        mitraId,
      );
      const semester = await this.SemesterService.findActiveSemester(
        mitraId,
        query.academicYearId,
      );

      if (!semester) {
        throw new NotFoundException(
          'Semester aktif belum dikonfigurasi untuk tahun ajaran ini',
        );
      }

      return {
        academicYearId: query.academicYearId,
        semesterId: semester.id,
      };
    }

    if (!query.academicYearId && query.semesterId) {
      const semester = await this.SemesterService.ensureSemester(
        query.semesterId,
        mitraId,
      );

      return {
        academicYearId: semester.academicYearId,
        semesterId: semester.id,
      };
    }

    const academicYear =
      await this.AcademicYearService.findActiveAcademicYear(mitraId);
    const semester = academicYear
      ? await this.SemesterService.findActiveSemester(mitraId, academicYear.id)
      : null;

    if (!academicYear || !semester) {
      throw new NotFoundException(
        'Tahun ajaran aktif dan semester aktif belum dikonfigurasi',
      );
    }

    return {
      academicYearId: academicYear.id,
      semesterId: semester.id,
    };
  }
}
