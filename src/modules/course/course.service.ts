import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Prisma, RoleScope } from '@prisma/client';
import type { AuthPayload } from '../auth/auth.types';
import { RolesPermissionService } from '../roles/roles.permission';
import { MitraAcademicAccessService } from '../mitra-academic/shared/mitra-academic-access.service';
import {
  courseInsidiaDetailSelect,
  courseInsidiaListSelect,
  CourseMitraDetailSelect,
  courseMitraDetailSelect,
  courseMitraListSelect,
  coursePermissionCodes,
} from './course.constants';
import type {
  CreateCourseDto,
  CreateCourseInsidiaDto,
  CreateCourseMitraDto,
} from './dto/create-course.dto';
import type {
  UpdateCourseDto,
  UpdateCourseInsidiaDto,
  UpdateCourseMitraDto,
} from './dto/update-course.dto';
import {
  buildCreateCourseInsidia,
  buildCreateCourseMitra,
  serializeCourseInsidiaDetail,
  serializeCourseInsidiaListItem,
  serializeCourseMitraDetail,
  serializeCourseMitraListItem,
  buildUpdateCourseInsidia,
  buildUpdateCourseMitra,
  normalizeSlugPart,
} from './course.mapper';
import { CoursePolicy } from './course.policy';
import { CourseRepository } from './course.repository';
import { AuthenticatedRequest } from 'src/shared/guards/access-token.guard';
import { CurriculumService } from '../curriculum/curriculum.service';
import { MitraService } from '../mitra/mitra.service';
import { randomUUID } from 'crypto';

@Injectable()
export class CourseService {
  constructor(
    private readonly courseRepository: CourseRepository,
    private readonly coursePolicy: CoursePolicy,
    private readonly rolesPermissionService: RolesPermissionService,
    private readonly mitraAcademicAccessService: MitraAcademicAccessService,
    private readonly curriculumService: CurriculumService,
    private readonly mitraService: MitraService,
  ) {}

  async create(
    createCourseDto: CreateCourseDto,
    request: AuthenticatedRequest,
  ) {
    const actorId = this.getActorId(request.auth);
    switch (createCourseDto.scope) {
      case RoleScope.INSIDIA:
        return this.createInsidiaCourse(createCourseDto, actorId);
      case RoleScope.MITRA:
        return this.createMitraCourse(createCourseDto, actorId);
      default:
        throw new BadRequestException('Scope course tidak valid');
    }
  }

  async findAll(request: AuthenticatedRequest, scope: RoleScope) {
    const actorId = this.getActorId(request.auth);

    switch (scope) {
      case RoleScope.INSIDIA:
        return this.findAllInsidia(actorId);

      case RoleScope.MITRA:
        return this.findAllMitra(request, actorId);
    }
  }

  async findOne(id: string, request: AuthenticatedRequest, scope: RoleScope) {
    switch (scope) {
      case RoleScope.INSIDIA:
        return await this.ensureCourseAccessible(
          request,
          id,
          scope,
          courseInsidiaDetailSelect,
        );
      case RoleScope.MITRA:
        return await this.ensureCourseAccessible(
          request,
          id,
          scope,
          courseMitraDetailSelect,
        );
    }
  }

  async update(
    id: string,
    updateCourseDto: UpdateCourseDto,
    request: AuthenticatedRequest,
  ) {
    const course = await this.findOne(id, request, updateCourseDto.scope);

    const nextScope = updateCourseDto.scope;
    if (nextScope !== course.scope) {
      throw new ConflictException('Perubahan scope course tidak didukung');
    }

    const actorId = this.getActorId(request.auth);

    switch (nextScope) {
      case RoleScope.INSIDIA:
        return this.updateInsidiaCourse(
          id,
          request,
          actorId,
          course,
          updateCourseDto as UpdateCourseInsidiaDto,
        );

      case RoleScope.MITRA:
        return this.updateMitraCourse(
          id,
          request,
          actorId,
          course,
          updateCourseDto as UpdateCourseMitraDto,
        );
    }
  }

  async remove(id: string, request: AuthenticatedRequest, scope: RoleScope) {
    const actorId = this.getActorId(request.auth);

    const course = await this.findOne(id, request, scope);

    const permissionCode =
      course.scope === 'MITRA'
        ? coursePermissionCodes.removeMitra
        : coursePermissionCodes.remove;

    const actor = await this.rolesPermissionService.hasPermission(actorId, {
      permission: permissionCode,
      scope: course.scope,
      mitraId: request.session?.activeMitraId ?? undefined,
      requireMitraContext: course.scope === 'MITRA' ? true : false,
    });

    this.coursePolicy.canManage(actor, course, request.auth);

    const deleted = await this.courseRepository.softDelete(id);

    if (!deleted) {
      throw new NotFoundException('Course tidak ditemukan');
    }

    return { message: 'Course berhasil dihapus' };
  }

  async createMitraCourse(
    createCourseDto: CreateCourseMitraDto,
    actorId: string,
  ) {
    const permissionCode = coursePermissionCodes.createMitra;

    const actor = await this.rolesPermissionService.hasPermission(actorId, {
      permission: permissionCode,
      scope: createCourseDto.scope,
      mitraId: createCourseDto.mitraId,
      requireMitraContext: true,
    });
    const context = this.mitraAcademicAccessService.mapActorContext(
      actorId,
      actor,
    );

    this.mitraAcademicAccessService.assertCanUseAcademicFeatures(context);

    const mitra = await this.ensureMitraCourseContext({
      mitraId: createCourseDto.mitraId,
      curriculumId: createCourseDto.curriculumId,
      code: createCourseDto.code,
      title: createCourseDto.title,
    });

    const course = await this.courseRepository.create(
      buildCreateCourseMitra(actorId, createCourseDto, {
        slug: mitra.mitraSlug,
      }),
      courseMitraDetailSelect,
    );

    return serializeCourseMitraDetail(course);
  }

  async createInsidiaCourse(
    createCourseDto: CreateCourseInsidiaDto,
    actorId: string,
  ) {
    const permissionCode = coursePermissionCodes.create;

    await this.rolesPermissionService.hasPermission(actorId, {
      permission: permissionCode,
      scope: createCourseDto.scope,
    });

    const course = await this.courseRepository.create(
      buildCreateCourseInsidia(actorId, createCourseDto, {
        slug: createCourseDto.slug,
      }),
      courseInsidiaDetailSelect,
    );

    return serializeCourseInsidiaDetail(course);
  }

  private async findAllInsidia(actorId: string) {
    const actor = await this.rolesPermissionService.hasPermission(actorId, {
      permission: coursePermissionCodes.view,
      scope: RoleScope.INSIDIA,
    });

    const canViewAll =
      actor.insidiaRole?.role.code === 'SUPER_ADMIN' ||
      actor.insidiaRole?.role.code === 'ADMIN';

    const courses = await this.courseRepository.findAll(
      {
        scope: RoleScope.INSIDIA,
        creatorId: canViewAll ? undefined : actorId,
      },
      courseInsidiaListSelect,
    );

    return courses.map((course) => serializeCourseInsidiaListItem(course));
  }

  private async findAllMitra(request: AuthenticatedRequest, actorId: string) {
    const activeMitraId = request.session?.activeMitraId!;

    const actor = await this.rolesPermissionService.hasPermission(actorId, {
      permission: coursePermissionCodes.viewMitra,
      scope: RoleScope.MITRA,
      mitraId: activeMitraId,
      requireMitraContext: true,
    });

    const context = this.mitraAcademicAccessService.mapActorContext(
      actorId,
      actor,
    );

    this.mitraAcademicAccessService.assertCanUseAcademicFeatures(context);

    const canViewAll = actor.mitraRoles?.some(
      (r) => r.role.code === 'AKADEMIK',
    );

    const courses = await this.courseRepository.findAll(
      {
        scope: RoleScope.MITRA,
        mitraId: activeMitraId,
        creatorId: canViewAll ? undefined : actorId,
      },
      courseMitraListSelect,
    );

    return courses.map((course) => serializeCourseMitraListItem(course));
  }

  private async updateInsidiaCourse(
    id: string,
    request: AuthenticatedRequest,
    actorId: string,
    course: any,
    updateCourseDto: UpdateCourseInsidiaDto,
  ) {
    const permissionCode = coursePermissionCodes.update;
    const actor = await this.rolesPermissionService.hasPermission(actorId, {
      permission: permissionCode,
      scope: RoleScope.INSIDIA,
    });

    this.coursePolicy.canManage(
      actor,
      { creatorId: course.creatorId },
      request.auth,
    );

    try {
      const updatedCourse = await this.courseRepository.update(
        id,
        buildUpdateCourseInsidia(course, updateCourseDto, {
          slug: updateCourseDto.slug,
        }),
        courseInsidiaDetailSelect,
      );

      return serializeCourseInsidiaDetail(updatedCourse);
    } catch (error) {
      this.handlePrismaError(error);
    }
  }
  private async updateMitraCourse(
    id: string,
    request: AuthenticatedRequest,
    actorId: string,
    course: any,
    updateCourseDto: UpdateCourseMitraDto,
  ) {
    const permissionCode = coursePermissionCodes.updateMitra;
    const actor = await this.rolesPermissionService.hasPermission(actorId, {
      permission: permissionCode,
      scope: RoleScope.MITRA,
      mitraId: request.session?.activeMitraId ?? undefined,
      requireMitraContext: true,
    });

    this.coursePolicy.canManage(actor, course, request.auth);

    const slug = await this.buildUpdatedMitraCourseSlug(
      course,
      updateCourseDto,
    );

    try {
      const updatedCourse = await this.courseRepository.update(
        id,
        buildUpdateCourseMitra(course, updateCourseDto, { slug }),
        courseMitraDetailSelect,
      );

      return serializeCourseMitraDetail(updatedCourse);
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async ensureCourseAccess(id: string, auth: AuthPayload) {
    const actorId = this.getActorId(auth);
    const course = await this.courseRepository.findAccessById(id);

    if (!course || course.deletedAt) {
      throw new NotFoundException('Mata pelajaran tidak ditemukan');
    }

    const permissionCode =
      course.scope === RoleScope.MITRA
        ? coursePermissionCodes.viewMitra
        : coursePermissionCodes.view;

    const actor = await this.rolesPermissionService.hasPermission(actorId, {
      permission: permissionCode,
      scope: course.scope,
      mitraId: undefined,
      requireMitraContext: course.scope === RoleScope.MITRA,
    });

    if (course.scope === RoleScope.MITRA) {
      const context = this.mitraAcademicAccessService.mapActorContext(
        actorId,
        actor,
      );

      this.mitraAcademicAccessService.assertCanUseAcademicFeatures(context);
    }

    return { actor, course };
  }

  async ensureCourseAccessible<T extends Prisma.CourseSelect>(
    request: AuthenticatedRequest,
    id: string,
    scope: RoleScope,
    select: T,
  ): Promise<Prisma.CourseGetPayload<{ select: T }>> {
    const actorId = this.getActorId(request.auth);

    const permissionCode =
      scope === RoleScope.MITRA
        ? coursePermissionCodes.viewMitra
        : coursePermissionCodes.view;

    const actor = await this.rolesPermissionService.hasPermission(actorId, {
      permission: permissionCode,
      scope: scope,
      mitraId: request.session?.activeMitraId ?? undefined,
      requireMitraContext: scope === RoleScope.MITRA ? true : false,
    });
    const coursePermission = await this.courseRepository.coursePermission(id);

    if (!coursePermission) {
      throw new NotFoundException('creatorId course tidak ditemukan');
    }

    this.coursePolicy.canManage(
      actor,
      { creatorId: coursePermission.creatorId },
      request.auth,
    );

    const course = await this.courseRepository.findActiveById(id, select);

    if (!course) {
      throw new NotFoundException('Mata pelajaran tidak ditemukan');
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
    title: string;
  }) {
    const { mitraId, curriculumId, code, title } = params;

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

    const [mitra, curriculum] = await Promise.all([
      this.mitraService.ensureMitraExists(mitraId),
      this.curriculumService.ensureCurriculum(curriculumId, mitraId),
    ]);
    const mitraSlug = await this.generateSubjectSlug(mitra.slug, code, title);
    return {
      mitraSlug,
      mitra,
      curriculum,
    };
  }

  private async buildUpdatedMitraCourseSlug(
    course: CourseMitraDetailSelect,
    updateCourseDto: UpdateCourseMitraDto,
  ) {
    const title = updateCourseDto.title ?? course.title;
    const code = updateCourseDto.code ?? course.code;
    const curriculumId =
      updateCourseDto.curriculumId ?? course.mitra?.curriculum?.id;
    const mitraSlug = await this.ensureMitraCourseContext({
      mitraId: course.mitra?.id ?? undefined,
      curriculumId: curriculumId ?? undefined,
      code,
      title,
    });

    if (
      updateCourseDto.title === undefined &&
      updateCourseDto.code === undefined &&
      updateCourseDto.slug === undefined
    ) {
      return undefined;
    }

    return mitraSlug.mitraSlug;
  }

  private readonly MAX_SLUG_ATTEMPTS = 100;

  async generateSubjectSlug(
    mitraSlug: string,
    code: string,
    name: string,
    ignoredId?: string,
  ): Promise<string> {
    const base = [mitraSlug, code, name]
      .filter(Boolean)
      .map(normalizeSlugPart)
      .filter(Boolean)
      .join('-');

    if (!base) {
      return `${mitraSlug}-${randomUUID().slice(0, 8)}`;
    }

    const existingSlugs = new Set(
      await this.courseRepository.findSubjectSlugsByPrefix(base, ignoredId),
    );

    for (let attempt = 0; attempt < this.MAX_SLUG_ATTEMPTS; attempt++) {
      const candidate = attempt === 0 ? base : `${base}-${attempt + 1}`;

      if (!existingSlugs.has(candidate)) {
        return candidate;
      }
    }

    throw new ConflictException(
      'Tidak dapat menghasilkan slug unik untuk mata pelajaran, silakan coba lagi',
    );
  }

  async ensureCourseExists<T extends Prisma.CourseSelect>(
    id: string,
    select: T,
  ): Promise<Prisma.CourseGetPayload<{ select: T }>> {
    const course = await this.courseRepository.findActiveById(id, select);

    if (!course) {
      throw new NotFoundException('Mata pelajaran tidak ditemukan');
    }
    return course;
  }
}
