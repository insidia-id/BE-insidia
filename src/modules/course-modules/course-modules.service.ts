import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, RoleScope } from '@prisma/client';
import type { AuthPayload } from '../auth/auth.types';
import type { CreateCourseModuleDto } from './dto/create-course-module.dto';
import type { UpdateCourseModuleDto } from './dto/update-course-module.dto';
import {
  mapCreateCourseModuleData,
  mapUpdateCourseModuleData,
  serializeCourseModuleInsidia,
  serializeCourseModuleMitra,
  serializeCourseModule,
  getModuleDomain,
  getModuleOwnerId,
} from './course-modules.mapper';
import { ModuleDomainContext } from './course-modules.constants';
import { CourseModulesRepository } from './course-modules.repository';
import { PrismaService } from '../../infrastruktur/prisma/prisma.service';
import { ClassGroupCourseService } from '../class-group-course/class-group-course.service';
import { AuthenticatedRequest } from 'src/shared/guards/access-token.guard';
import { ClassGroupService } from '../class-group/class-group.service';
import { activeRoleCode } from '../../shared/session/active-mitra-session';
import { CoursePolicy } from '../course/course.policy';
@Injectable()
export class CourseModulesService {
  constructor(
    private readonly courseModulesRepository: CourseModulesRepository,
    private readonly coursePolicy: CoursePolicy,
    private readonly prisma: PrismaService,
    private readonly classGroupService: ClassGroupService,
    private readonly classGroupCourseService: ClassGroupCourseService,
  ) {}

  async createForInsidia(
    courseInsidiaId: string,
    createCourseModuleDto: CreateCourseModuleDto,
    request: AuthenticatedRequest,
  ) {
    const courseInsidia = await this.prisma.courseInsidia.findFirst({
      where: {
        id: courseInsidiaId,
        course: {
          deletedAt: null,
        },
      },
      select: {
        id: true,
        course: {
          select: {
            id: true,
            creatorId: true,
            title: true,
          },
        },
      },
    });

    if (!courseInsidia) {
      throw new NotFoundException('Course Insidia tidak ditemukan');
    }

    const { activeInsidiaRole, activeMitraRole } = activeRoleCode(request);
    this.coursePolicy.canManageInsidia(
      { activeMitraRole, activeInsidiaRole },
      courseInsidia.course,
      request.auth,
    );

    const domainContext: ModuleDomainContext = {
      domain: 'INSIDIA',
      courseInsidiaId,
    };

    try {
      const module = await this.courseModulesRepository.create(
        mapCreateCourseModuleData(domainContext, createCourseModuleDto),
      );

      return module;
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async createForMitra(
    classGroupCourseId: string,
    createCourseModuleDto: CreateCourseModuleDto,
    request: AuthenticatedRequest,
    activeMitraId: string,
  ) {
    const classGroupCourse =
      await this.classGroupCourseService.ensureClassGroupCourse(
        classGroupCourseId,
        activeMitraId,
      );
    const { activeInsidiaRole, activeMitraRole } = activeRoleCode(request);

    this.coursePolicy.canManageMitra(
      { activeMitraRole, activeInsidiaRole },
      { creatorId: classGroupCourse.teacherId },
      request.auth,
    );
    const domainContext: ModuleDomainContext = {
      domain: 'MITRA',
      classGroupCourseId,
    };

    try {
      const module = await this.courseModulesRepository.create(
        mapCreateCourseModuleData(domainContext, createCourseModuleDto),
      );

      return module;
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async findByCourseInsidiaId(courseInsidiaId: string) {
    const courseInsidia = await this.prisma.courseInsidia.findFirst({
      where: {
        id: courseInsidiaId,
        course: {
          deletedAt: null,
        },
      },
    });

    if (!courseInsidia) {
      throw new NotFoundException('Course Insidia tidak ditemukan');
    }

    const modules =
      await this.courseModulesRepository.findByCourseInsidiaId(courseInsidiaId);

    return modules.map((module) => serializeCourseModuleInsidia(module));
  }

  async findByClassGroupCourseId(
    classGroupCourseId: string,
    request: AuthenticatedRequest,
  ) {
    const { activeInsidiaRole, activeMitraRole } = activeRoleCode(request);

    const classGroupCourse =
      await this.classGroupCourseService.ensureClassGroupCourse(
        classGroupCourseId,
        request.session.activeMitraId,
      );
    const teacherId = classGroupCourse?.teacherId;

    const membership =
      await this.classGroupService.ensureStudentOrTeacherInClassGroup(
        classGroupCourse.classGroupId,
        request.auth.sub,
      );
    this.coursePolicy.canView(
      { activeMitraRole, activeInsidiaRole },
      teacherId,
      request.auth,
      membership,
    );
    const modules =
      await this.courseModulesRepository.findByClassGroupCourseId(
        classGroupCourseId,
      );
    const serializedModules = modules.map((module) =>
      serializeCourseModuleMitra(module),
    );
    return serializedModules;
  }

  async findOne(id: string, request: AuthenticatedRequest) {
    const module = await this.ensureModuleExists(id);

    if (module.classGroupCourse) {
      return this.findMitraModuleByid(id, request);
    } else {
      return this.findModuleInsidiaById(id, request);
    }
  }

  async findMitraModuleByid(id: string, request: AuthenticatedRequest) {
    const { activeInsidiaRole, activeMitraRole } = activeRoleCode(request);
    const findModule = await this.findModuleMitraById(id);

    const teacherId = findModule?.classGroupCourse?.teacherId;

    let isRegistered = {
      isStudent: false,
    };

    if (activeMitraRole === 'MURID') {
      isRegistered = await this.ensureMuridRegisteredForModule(
        id,
        request.auth.sub,
      );
    }

    this.coursePolicy.canView(
      { activeMitraRole, activeInsidiaRole },
      teacherId,
      request.auth,
      {
        isTeacher: false,
        isStudent: isRegistered.isStudent,
      },
    );

    const serializedModules = serializeCourseModuleMitra(findModule);
    return serializedModules;
  }

  async findModuleInsidiaById(id: string, request: AuthenticatedRequest) {
    const module = await this.courseModulesRepository.findModuleInsidiaByid(id);

    if (!module) {
      throw new NotFoundException('Module course tidak ditemukan');
    }
    const { activeInsidiaRole, activeMitraRole } = activeRoleCode(request);

    this.coursePolicy.canView(
      { activeMitraRole, activeInsidiaRole },
      module.courseInsidia?.course.creatorId,
      request.auth,
    );
    return module;
  }

  async update(
    id: string,
    updateCourseModuleDto: UpdateCourseModuleDto,
    request: AuthenticatedRequest,
  ) {
    const module = await this.ensureModuleExists(id);

    const { activeInsidiaRole, activeMitraRole } = activeRoleCode(request);

    if (module.courseInsidia) {
      this.coursePolicy.canManageInsidia(
        { activeMitraRole, activeInsidiaRole },
        { creatorId: module.courseInsidia.course.creatorId },
        request.auth,
      );
    } else {
      this.coursePolicy.canManageMitra(
        { activeMitraRole, activeInsidiaRole },
        { creatorId: module.classGroupCourse?.teacherId },
        request.auth,
      );
    }

    try {
      const updatedModule = await this.courseModulesRepository.update(
        id,
        mapUpdateCourseModuleData(updateCourseModuleDto),
      );

      return serializeCourseModule(updatedModule);
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async remove(id: string, request: AuthenticatedRequest) {
    const module = await this.ensureModuleExists(id);
    const { activeInsidiaRole, activeMitraRole } = activeRoleCode(request);

    if (module.courseInsidia) {
      this.coursePolicy.canManageInsidia(
        { activeMitraRole, activeInsidiaRole },
        { creatorId: module.courseInsidia.course.creatorId },
        request.auth,
      );
    } else {
      this.coursePolicy.canManageMitra(
        { activeMitraRole, activeInsidiaRole },
        { creatorId: module.classGroupCourse?.teacherId },
        request.auth,
      );
    }

    const deleted = await this.courseModulesRepository.remove(id);

    if (!deleted) {
      throw new NotFoundException('Module course tidak ditemukan');
    }

    return { message: 'Module course berhasil dihapus' };
  }

  async findModuleMitraById(id: string) {
    const module = await this.courseModulesRepository.findModuleMitraByid(id);
    if (!module) {
      throw new NotFoundException('Module course tidak ditemukan');
    }

    return module;
  }

  async ensureModuleExists(id: string) {
    const module = await this.courseModulesRepository.findById(id);

    if (!module) {
      throw new NotFoundException('Module course tidak ditemukan');
    }

    return module;
  }

  async ensureMuridRegisteredForModule(moduleId: string, muridId: string) {
    const isRegistered =
      await this.courseModulesRepository.ensureMuridRegisteredForModule(
        moduleId,
        muridId,
      );

    if (!isRegistered) {
      throw new ForbiddenException(
        'user tidak terdaftar di course ini, silahkan mendaftar terlebih dahulu',
      );
    }
    const membership = {
      isStudent:
        (isRegistered.classGroupCourse?.classGroup.classGroupStudents.length ??
          0) > 0,
    };
    return membership;
  }

  private handlePrismaError(error: unknown): never {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new ConflictException(
        'Urutan module sudah digunakan di course ini',
      );
    }

    throw error;
  }
}
