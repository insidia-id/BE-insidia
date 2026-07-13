import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  serializeLearningItem,
  getLearningItemDomain,
  getLearningItemOwnerId,
} from './learning-items.mapper';
import { LearningItemsRepository } from './learning-items.repository';
import { CourseModulesService } from '../course-modules/course-modules.service';
import { activeRoleCode } from 'src/shared/session/active-mitra-session';
import { AuthenticatedRequest } from 'src/shared/guards/access-token.guard';
import { CoursePolicy } from '../course/course.policy';
import { LearningItemRecord } from './learning-items.constants';
@Injectable()
export class LearningItemsService {
  constructor(
    private readonly learningItemsRepository: LearningItemsRepository,
    private readonly CoursePolicy: CoursePolicy,
    private readonly courseModulesService: CourseModulesService,
  ) {}

  async findByModuleId(moduleId: string, request: AuthenticatedRequest) {
    const { activeInsidiaRole, activeMitraRole } = activeRoleCode(request);
    const module = await this.courseModulesService.ensureModuleExists(moduleId);
    let registration = {
      isStudent: false,
    };
    if (activeMitraRole === 'MURID') {
      registration =
        await this.courseModulesService.ensureMuridRegisteredForModule(
          moduleId,
          request.auth.sub,
        );
    }

    if (module.courseInsidia) {
      this.CoursePolicy.canManageInsidia(
        { activeMitraRole, activeInsidiaRole },
        { creatorId: module.courseInsidia.course.creatorId },
        request.auth,
      );
    } else if (module.classGroupCourse) {
      this.CoursePolicy.canView(
        { activeMitraRole, activeInsidiaRole },
        module.classGroupCourse?.teacherId,
        request.auth,
        {
          isTeacher: false,
          isStudent: registration.isStudent,
        },
      );
    }

    const items = await this.learningItemsRepository.findByModuleId(moduleId, {
      studentView: registration.isStudent,
    });

    return items.map((item) =>
      serializeLearningItem(item, {
        locked: registration.isStudent && this.isLearningItemLocked(item),
      }),
    );
  }

  async ensureCanManageLearningItem(id: string, request: AuthenticatedRequest) {
    const item = await this.ensureItemExists(id);
    const { activeInsidiaRole, activeMitraRole } = activeRoleCode(request);

    const domain = getLearningItemDomain(item);
    const ownerId = getLearningItemOwnerId(item);

    if (domain === 'INSIDIA') {
      this.CoursePolicy.canManageInsidia(
        { activeMitraRole, activeInsidiaRole },
        { creatorId: ownerId },
        request.auth,
      );
    } else {
      this.CoursePolicy.canManageMitra(
        { activeMitraRole, activeInsidiaRole },
        { creatorId: ownerId },
        request.auth,
      );
    }

    return serializeLearningItem(item);
  }

  async ensureAcessToLearningItem(id: string, request: AuthenticatedRequest) {
    const item = await this.ensureItemExists(id);
    const { activeInsidiaRole, activeMitraRole } = activeRoleCode(request);

    let registration = {
      isStudent: false,
    };
    if (activeMitraRole === 'MURID') {
      registration =
        await this.courseModulesService.ensureMuridRegisteredForModule(
          item.moduleId,
          request.auth.sub,
        );
    }

    this.CoursePolicy.canView(
      { activeMitraRole, activeInsidiaRole },
      getLearningItemOwnerId(item),
      request.auth,
      {
        isTeacher: false,
        isStudent: registration.isStudent,
      },
    );
    this.isLearningItemAvailable(registration.isStudent, item);

    return serializeLearningItem(item, {
      locked: registration.isStudent && this.isLearningItemLocked(item),
    });
  }

  async ensureItemExists(id: string) {
    const item = await this.learningItemsRepository.findById(id);

    if (!item) {
      throw new NotFoundException('Learning item tidak ditemukan');
    }

    return item;
  }

  async ValidateLearningItemOwnership(
    moduleId: string,
    request: AuthenticatedRequest,
  ) {
    const module = await this.courseModulesService.ensureModuleExists(moduleId);
    const { activeInsidiaRole, activeMitraRole } = activeRoleCode(request);
    if (module.courseInsidia) {
      this.CoursePolicy.canManageInsidia(
        { activeMitraRole, activeInsidiaRole },
        { creatorId: module.courseInsidia.course.creatorId },
        request.auth,
      );
    } else if (module.classGroupCourse) {
      this.CoursePolicy.canManageMitra(
        { activeMitraRole, activeInsidiaRole },
        { creatorId: module.classGroupCourse.teacherId },
        request.auth,
      );
    } else {
      throw new BadRequestException('Module tidak memiliki domain yang valid');
    }
    return module;
  }

  isLearningItemLocked(item: {
    availableFrom: Date | null;
    availableUntil: Date | null;
  }) {
    const now = new Date();

    if (item.availableFrom && item.availableFrom > now) {
      return true;
    }

    if (item.availableUntil && item.availableUntil < now) {
      return true;
    }

    return false;
  }

  isLearningItemAvailable(isStudent: boolean, item: LearningItemRecord) {
    if (isStudent) {
      if (!item.published) {
        throw new ForbiddenException(
          'Learning item belum dipublikasikan, silakan hubungi guru untuk mengaksesnya',
        );
      }

      const now = new Date();

      if (item.availableFrom && item.availableFrom > now) {
        throw new ForbiddenException(
          'Learning item belum tersedia, silakan hubungi guru untuk mengaksesnya',
        );
      }

      if (item.availableUntil && item.availableUntil < now) {
        throw new ForbiddenException(
          'Learning item sudah tidak tersedia, silakan hubungi guru untuk mengaksesnya',
        );
      }
    }
    return true;
  }
}
