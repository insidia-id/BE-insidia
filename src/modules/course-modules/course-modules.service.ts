import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { AuthPayload } from '../auth/auth.types';
import type { CreateCourseModuleDto } from './dto/create-course-module.dto';
import type { UpdateCourseModuleDto } from './dto/update-course-module.dto';
import {
  mapCreateCourseModuleData,
  mapUpdateCourseModuleData,
  serializeCourseModule,
  getModuleDomain,
  getModuleOwnerId,
  type ModuleDomainContext,
} from './course-modules.mapper';
import { CourseModulesPolicy } from './course-modules.policy';
import { CourseModulesRepository } from './course-modules.repository';
import { PrismaService } from '../../infrastruktur/prisma/prisma.service';
import { UserRepository } from '../user/user.repository';

@Injectable()
export class CourseModulesService {
  constructor(
    private readonly courseModulesRepository: CourseModulesRepository,
    private readonly courseModulesPolicy: CourseModulesPolicy,
    private readonly prisma: PrismaService,
    private readonly userRepository: UserRepository,
  ) {}

  private getActorId(auth: AuthPayload): string {
    return auth.sub;
  }

  /**
   * Create module for INSIDIA domain
   */
  async createForInsidia(
    courseInsidiaId: string,
    createCourseModuleDto: CreateCourseModuleDto,
    auth: AuthPayload,
  ) {
    const actorId = this.getActorId(auth);

    // Verify CourseInsidia exists and get creator
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

    // Get actor and check authorization
    const actor = await this.userRepository.findRoleByUserId(actorId);
    if (!actor) {
      throw new NotFoundException('User tidak ditemukan');
    }
    this.courseModulesPolicy.canManageInsidia(
      actor,
      courseInsidia.course,
      auth,
    );

    // Create module
    const domainContext: ModuleDomainContext = {
      domain: 'INSIDIA',
      courseInsidiaId,
    };

    try {
      const module = await this.courseModulesRepository.create(
        mapCreateCourseModuleData(domainContext, createCourseModuleDto),
      );

      return serializeCourseModule(module);
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  /**
   * Create module for MITRA domain
   */
  async createForMitra(
    classGroupCourseId: string,
    createCourseModuleDto: CreateCourseModuleDto,
    auth: AuthPayload,
  ) {
    // Verify ClassGroupCourse exists and get teacher
    const classGroupCourse = await this.prisma.classGroupCourse.findFirst({
      where: {
        id: classGroupCourseId,
        deletedAt: null,
      },
      select: {
        id: true,
        teacherId: true,
        courseMitra: {
          select: {
            course: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
      },
    });

    if (!classGroupCourse) {
      throw new NotFoundException('Class Group Course tidak ditemukan');
    }

    // Get actor and check authorization
    const actorId = this.getActorId(auth);
    const actor = await this.userRepository.findRoleByUserId(actorId);
    if (!actor) {
      throw new NotFoundException('User tidak ditemukan');
    }
    this.courseModulesPolicy.canManageMitra(actor, classGroupCourse, auth);

    // Create module
    const domainContext: ModuleDomainContext = {
      domain: 'MITRA',
      classGroupCourseId,
    };

    try {
      const module = await this.courseModulesRepository.create(
        mapCreateCourseModuleData(domainContext, createCourseModuleDto),
      );

      return serializeCourseModule(module);
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  /**
   * Find modules by CourseInsidia ID
   */
  async findByCourseInsidiaId(courseInsidiaId: string, auth: AuthPayload) {
    // Verify CourseInsidia exists
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

    return modules.map((module) => serializeCourseModule(module));
  }

  /**
   * Find modules by ClassGroupCourse ID
   */
  async findByClassGroupCourseId(
    classGroupCourseId: string,
    auth: AuthPayload,
  ) {
    // Verify ClassGroupCourse exists
    const classGroupCourse = await this.prisma.classGroupCourse.findFirst({
      where: {
        id: classGroupCourseId,
        deletedAt: null,
      },
    });

    if (!classGroupCourse) {
      throw new NotFoundException('Class Group Course tidak ditemukan');
    }

    const modules =
      await this.courseModulesRepository.findByClassGroupCourseId(
        classGroupCourseId,
      );

    return modules.map((module) => serializeCourseModule(module));
  }

  /**
   * Find one module by ID
   */
  async findOne(id: string, auth: AuthPayload) {
    const module = await this.ensureModuleExists(id);

    // Get actor and check authorization based on domain
    const actorId = this.getActorId(auth);
    const actor = await this.userRepository.findRoleByUserId(actorId);
    if (!actor) {
      throw new NotFoundException('User tidak ditemukan');
    }

    const domain = getModuleDomain(module);
    const ownerId = getModuleOwnerId(module);

    if (domain === 'INSIDIA') {
      this.courseModulesPolicy.canManageInsidia(
        actor,
        { creatorId: ownerId },
        auth,
      );
    } else {
      this.courseModulesPolicy.canManageMitra(
        actor,
        { teacherId: ownerId },
        auth,
      );
    }

    return serializeCourseModule(module);
  }

  /**
   * Update module
   */
  async update(
    id: string,
    updateCourseModuleDto: UpdateCourseModuleDto,
    auth: AuthPayload,
  ) {
    const module = await this.ensureModuleExists(id);

    // Get actor and check authorization based on domain
    const actorId = this.getActorId(auth);
    const actor = await this.userRepository.findRoleByUserId(actorId);
    if (!actor) {
      throw new NotFoundException('User tidak ditemukan');
    }

    const domain = getModuleDomain(module);
    const ownerId = getModuleOwnerId(module);

    if (domain === 'INSIDIA') {
      this.courseModulesPolicy.canManageInsidia(
        actor,
        { creatorId: ownerId },
        auth,
      );
    } else {
      this.courseModulesPolicy.canManageMitra(
        actor,
        { teacherId: ownerId },
        auth,
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

  /**
   * Remove module
   */
  async remove(id: string, auth: AuthPayload) {
    const module = await this.ensureModuleExists(id);

    // Get actor and check authorization based on domain
    const actorId = this.getActorId(auth);
    const actor = await this.userRepository.findRoleByUserId(actorId);
    if (!actor) {
      throw new NotFoundException('User tidak ditemukan');
    }

    const domain = getModuleDomain(module);
    const ownerId = getModuleOwnerId(module);

    if (domain === 'INSIDIA') {
      this.courseModulesPolicy.canManageInsidia(
        actor,
        { creatorId: ownerId },
        auth,
      );
    } else {
      this.courseModulesPolicy.canManageMitra(
        actor,
        { teacherId: ownerId },
        auth,
      );
    }

    const deleted = await this.courseModulesRepository.remove(id);

    if (!deleted) {
      throw new NotFoundException('Module course tidak ditemukan');
    }

    return { message: 'Module course berhasil dihapus' };
  }

  /**
   * Ensure module exists and return it
   */
  async ensureModuleExists(id: string) {
    const module = await this.courseModulesRepository.findById(id);

    if (!module) {
      throw new NotFoundException('Module course tidak ditemukan');
    }

    return module;
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
