import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { AuthPayload } from '../auth/auth.types';
import { CourseService } from '../course/course.service';
import type { CreateCourseModuleDto } from './dto/create-course-module.dto';
import type { UpdateCourseModuleDto } from './dto/update-course-module.dto';
import {
  mapCreateCourseModuleData,
  mapUpdateCourseModuleData,
  serializeCourseModule,
} from './course-modules.mapper';
import { CourseModulesPolicy } from './course-modules.policy';
import { CourseModulesRepository } from './course-modules.repository';

@Injectable()
export class CourseModulesService {
  constructor(
    private readonly courseModulesRepository: CourseModulesRepository,
    private readonly courseModulesPolicy: CourseModulesPolicy,
    private readonly courseService: CourseService,
  ) {}

  async create(
    courseId: string,
    createCourseModuleDto: CreateCourseModuleDto,
    auth: AuthPayload,
  ) {
    await this.courseService.ensureCourseAccess(courseId, auth);

    try {
      const module = await this.courseModulesRepository.create(
        mapCreateCourseModuleData(courseId, createCourseModuleDto),
      );

      return serializeCourseModule(module);
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async findByCourseId(courseId: string, auth: AuthPayload) {
    await this.courseService.ensureCourseAccess(courseId, auth);

    const modules = await this.courseModulesRepository.findByCourseId(courseId);

    return modules.map((module) => serializeCourseModule(module));
  }

  async findOne(id: string, auth: AuthPayload) {
    const module = await this.ensureModuleExists(id);
    const actor = await this.courseService.ensureCourseAccess(
      module.courseId,
      auth,
    );
    this.courseModulesPolicy.canManage(actor, module);

    return serializeCourseModule(module);
  }

  async update(
    id: string,
    updateCourseModuleDto: UpdateCourseModuleDto,
    auth: AuthPayload,
  ) {
    const module = await this.ensureModuleExists(id);
    const actor = await this.courseService.ensureCourseAccess(
      module.courseId,
      auth,
    );
    this.courseModulesPolicy.canManage(actor, module);

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

  async remove(id: string, auth: AuthPayload) {
    const module = await this.ensureModuleExists(id);

    const actor = await this.courseService.ensureCourseAccess(
      module.courseId,
      auth,
    );
    this.courseModulesPolicy.canManage(actor, module);

    const deleted = await this.courseModulesRepository.remove(id);

    if (!deleted) {
      throw new NotFoundException('Module course tidak ditemukan');
    }

    return { message: 'Module course berhasil dihapus' };
  }

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
