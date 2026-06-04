import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CourseStatus, Prisma, RoleScope } from '@prisma/client';
import type { AuthPayload } from '../auth/auth.types';
import { RolesPermissionService } from '../roles/roles.permission';
import { MitraAcademicAccessService } from '../mitra-academic/shared/mitra-academic-access.service';
import { coursePermissionCodes } from './course.constants';
import type { CreateCourseDto } from './dto/create-course.dto';
import type { UpdateCourseDto } from './dto/update-course.dto';
import {
  mapCreateCourseData,
  mapUpdateCourseData,
  serializeCourseDetail,
  serializeCourseListItem,
} from './course.mapper';
import { CoursePolicy } from './course.policy';
import { CourseRepository } from './course.repository';

@Injectable()
export class CourseService {
  constructor(
    private readonly courseRepository: CourseRepository,
    private readonly coursePolicy: CoursePolicy,
    private readonly rolesPermissionService: RolesPermissionService,
    private readonly mitraAcademicAccessService: MitraAcademicAccessService,
  ) {}

  async create(createCourseDto: CreateCourseDto, auth: AuthPayload) {
    const actorId = this.getActorId(auth);
    const isMitraCourse = createCourseDto.scope === 'MITRA';

    const permissionCode = isMitraCourse
      ? coursePermissionCodes.createMitra
      : coursePermissionCodes.create;

    await this.rolesPermissionService.hasPermission(actorId, {
      permission: permissionCode,
      scope: createCourseDto.scope,
      mitraId: isMitraCourse ? createCourseDto.mitraId : undefined,
      requireMitraContext: isMitraCourse ? true : false,
    });

    const mitraSlug =
      createCourseDto.scope === 'MITRA'
        ? await this.ensureMitraCourseContext({
            mitraId: createCourseDto.mitraId,
            curriculumId: createCourseDto.curriculumId,
            code: createCourseDto.code,
          })
        : null;

    try {
      const course = await this.courseRepository.create(
        mapCreateCourseData(createCourseDto, actorId, {
          slug:
            createCourseDto.scope === 'MITRA' && mitraSlug
              ? await this.mitraAcademicAccessService.generateSubjectSlug(
                  mitraSlug,
                  createCourseDto.code!,
                  createCourseDto.title,
                )
              : undefined,
        }),
      );

      return serializeCourseDetail(course);
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async findAll(
    auth: AuthPayload,
    scope: RoleScope,
    status?: CourseStatus,
    mitraId?: string,
  ) {
    const actorId = this.getActorId(auth);
    const isMitraScope = scope === 'MITRA';
    const permissionCode = isMitraScope
      ? coursePermissionCodes.viewMitra
      : coursePermissionCodes.view;

    const actor = await this.rolesPermissionService.hasPermission(actorId, {
      permission: permissionCode,
      scope,
      mitraId: isMitraScope ? mitraId : undefined,
      requireMitraContext: isMitraScope ? true : false,
    });
    const canViewAllMitraCourses =
      scope === 'MITRA' && actor.mitraRoles?.role.code === 'AKADEMIK';

    const courses = await this.courseRepository.findAll({
      scope,
      status,
      mitraId,

      creatorId:
        actor.insidiaRole?.role.code === 'SUPER_ADMIN' ||
        actor.insidiaRole?.role.code === 'ADMIN' ||
        canViewAllMitraCourses
          ? undefined
          : actorId,
    });

    return courses.map((course) => serializeCourseListItem(course));
  }

  async findOne(id: string, auth: AuthPayload) {
    const actorId = this.getActorId(auth);
    const course = await this.ensureCourseExists(id);

    const permissionCode =
      course.scope === 'MITRA'
        ? coursePermissionCodes.viewMitra
        : coursePermissionCodes.view;

    const actor = await this.rolesPermissionService.hasPermission(actorId, {
      permission: permissionCode,
      scope: course.scope,
      mitraId: course.mitraId ?? undefined,
      requireMitraContext: course.scope === 'MITRA' ? true : false,
    });

    this.coursePolicy.canManage(actor, course, auth);

    return serializeCourseDetail(course);
  }

  async update(
    id: string,
    updateCourseDto: UpdateCourseDto,
    auth: AuthPayload,
  ) {
    const course = await this.ensureCourseExists(id);
    const nextScope = updateCourseDto.scope ?? course.scope;
    if (nextScope !== course.scope) {
      throw new ConflictException('Perubahan scope course tidak didukung');
    }

    const actorId = this.getActorId(auth);
    const permissionCode =
      nextScope === 'MITRA'
        ? coursePermissionCodes.updateMitra
        : coursePermissionCodes.update;

    const actor = await this.rolesPermissionService.hasPermission(actorId, {
      permission: permissionCode,
      scope: nextScope,
      mitraId: course.mitraId ?? undefined,
      requireMitraContext: nextScope === 'MITRA' ? true : false,
    });
    this.coursePolicy.canManage(actor, course, auth);
    const slug =
      nextScope === 'MITRA'
        ? await this.buildUpdatedMitraCourseSlug(course, updateCourseDto)
        : undefined;

    try {
      const updatedCourse = await this.courseRepository.update(
        id,
        mapUpdateCourseData(updateCourseDto, course, { slug }),
      );

      return serializeCourseDetail(updatedCourse);
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async remove(id: string, auth: AuthPayload) {
    const actorId = this.getActorId(auth);
    const course = await this.ensureCourseExists(id);
    const permissionCode =
      course.scope === 'MITRA'
        ? coursePermissionCodes.removeMitra
        : coursePermissionCodes.remove;

    const actor = await this.rolesPermissionService.hasPermission(actorId, {
      permission: permissionCode,
      scope: course.scope,
      mitraId: course.mitraId ?? undefined,
      requireMitraContext: course.scope === 'MITRA' ? true : false,
    });
    this.coursePolicy.canManage(actor, course, auth);

    const deleted = await this.courseRepository.softDelete(id);

    if (!deleted) {
      throw new NotFoundException('Course tidak ditemukan');
    }

    return { message: 'Course berhasil dihapus' };
  }

  async ensureCourseAccess(id: string, auth: AuthPayload) {
    const course = await this.ensureCourseAccessRecord(id);
    const actor = await this.rolesPermissionService.hasPermission(auth.sub, {
      permission:
        course.scope === 'MITRA'
          ? coursePermissionCodes.viewMitra
          : coursePermissionCodes.view,
      scope: course.scope,
      mitraId: course.mitraId ?? undefined,
      requireMitraContext: course.scope === 'MITRA' ? true : false,
    });
    this.coursePolicy.canManage(actor, course, auth);
    return actor;
  }

  async ensureCourseAccessRecord(id: string) {
    const course = await this.courseRepository.findAccessById(id);

    if (!course) {
      throw new NotFoundException('Course tidak ditemukan');
    }

    return course;
  }

  private async ensureCourseExists(id: string) {
    const course = await this.courseRepository.findActiveById(id);

    if (!course) {
      throw new NotFoundException('Course tidak ditemukan');
    }

    return course;
  }

  private getActorId(auth: AuthPayload) {
    if (!auth.sub) {
      throw new UnauthorizedException('Token tidak valid');
    }

    return auth.sub;
  }

  private handlePrismaError(error: unknown): never {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new ConflictException('Slug course sudah digunakan');
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2003'
    ) {
      throw new NotFoundException('Kategori course tidak ditemukan');
    }

    throw error;
  }

  private async ensureMitraCourseContext(params: {
    mitraId?: string;
    curriculumId?: string;
    code?: string | null;
  }) {
    const { mitraId, curriculumId, code } = params;

    if (!mitraId) {
      throw new BadRequestException('mitraId wajib diisi untuk course MITRA');
    }

    if (!curriculumId) {
      throw new BadRequestException(
        'curriculumId wajib diisi untuk course MITRA',
      );
    }

    if (!code) {
      throw new BadRequestException('kode wajib diisi untuk course MITRA');
    }

    const [mitra] = await Promise.all([
      this.mitraAcademicAccessService.ensureMitraExists(mitraId),
      this.mitraAcademicAccessService.ensureCurriculum(curriculumId, mitraId),
    ]);

    return mitra.slug;
  }

  private async buildUpdatedMitraCourseSlug(
    course: Awaited<ReturnType<CourseService['ensureCourseExists']>>,
    updateCourseDto: UpdateCourseDto,
  ) {
    const title = updateCourseDto.title ?? course.title;
    const code = updateCourseDto.code ?? course.code;
    const curriculumId = updateCourseDto.curriculumId ?? course.curriculumId;
    const mitraSlug = await this.ensureMitraCourseContext({
      mitraId: course.mitraId ?? undefined,
      curriculumId: curriculumId ?? undefined,
      code,
    });

    if (
      updateCourseDto.title === undefined &&
      updateCourseDto.code === undefined &&
      updateCourseDto.slug === undefined
    ) {
      return undefined;
    }

    return this.mitraAcademicAccessService.generateSubjectSlug(
      mitraSlug,
      code!,
      title,
      course.id,
    );
  }
}
