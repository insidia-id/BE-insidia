import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { AuthPayload } from '../auth/auth.types';
import { CourseModulesRepository } from '../course-modules/course-modules.repository';
import { UserRepository } from '../user/user.repository';
import type { CreateLearningItemDto } from './dto/create-learning-item.dto';
import type { UpdateLearningItemDto } from './dto/update-learning-item.dto';
import {
  mapCreateLearningItemData,
  mapUpdateLearningItemData,
  serializeLearningItem,
  getLearningItemDomain,
  getLearningItemOwnerId,
} from './learning-items.mapper';
import { LearningItemsPolicy } from './learning-items.policy';
import { LearningItemsRepository } from './learning-items.repository';

@Injectable()
export class LearningItemsService {
  constructor(
    private readonly learningItemsRepository: LearningItemsRepository,
    private readonly learningItemsPolicy: LearningItemsPolicy,
    private readonly courseModulesRepository: CourseModulesRepository,
    private readonly userRepository: UserRepository,
  ) {}

  private getActorId(auth: AuthPayload): string {
    return auth.sub;
  }

  async create(
    moduleId: string,
    createLearningItemDto: CreateLearningItemDto,
    auth: AuthPayload,
  ) {
    const actorId = this.getActorId(auth);

    // Get module with domain relations to determine access
    const module = await this.courseModulesRepository.findById(moduleId);

    if (!module) {
      throw new NotFoundException('Module tidak ditemukan');
    }

    // Get actor for authorization
    const actor = await this.userRepository.findRoleByUserId(actorId);
    if (!actor) {
      throw new NotFoundException('User tidak ditemukan');
    }

    // Check authorization based on domain
    if (module.courseInsidiaId && module.courseInsidia) {
      this.learningItemsPolicy.canManageInsidia(
        actor,
        { creatorId: module.courseInsidia.course.creatorId },
        auth,
      );
    } else if (module.classGroupCourseId && module.classGroupCourse) {
      this.learningItemsPolicy.canManageMitra(
        actor,
        { teacherId: module.classGroupCourse.teacherId },
        auth,
      );
    } else {
      throw new BadRequestException('Module tidak memiliki domain yang valid');
    }

    try {
      const learningItem = await this.learningItemsRepository.create(
        mapCreateLearningItemData(moduleId, createLearningItemDto),
      );

      return serializeLearningItem(learningItem);
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async findByModuleId(moduleId: string, auth: AuthPayload) {
    const actorId = this.getActorId(auth);

    // Get module to check access
    const module = await this.courseModulesRepository.findById(moduleId);

    if (!module) {
      throw new NotFoundException('Module tidak ditemukan');
    }

    // Get actor for authorization
    const actor = await this.userRepository.findRoleByUserId(actorId);
    if (!actor) {
      throw new NotFoundException('User tidak ditemukan');
    }

    // Check authorization based on domain
    if (module.courseInsidiaId && module.courseInsidia) {
      this.learningItemsPolicy.canManageInsidia(
        actor,
        { creatorId: module.courseInsidia.course.creatorId },
        auth,
      );
    } else if (module.classGroupCourseId && module.classGroupCourse) {
      this.learningItemsPolicy.canManageMitra(
        actor,
        { teacherId: module.classGroupCourse.teacherId },
        auth,
      );
    } else {
      throw new BadRequestException('Module tidak memiliki domain yang valid');
    }

    const items = await this.learningItemsRepository.findByModuleId(moduleId);

    return items.map((item) => serializeLearningItem(item));
  }

  async findOne(id: string, auth: AuthPayload) {
    const item = await this.ensureItemExists(id);
    const actorId = this.getActorId(auth);

    // Get actor for authorization
    const actor = await this.userRepository.findRoleByUserId(actorId);
    if (!actor) {
      throw new NotFoundException('User tidak ditemukan');
    }

    // Check authorization based on domain
    const domain = getLearningItemDomain(item);
    const ownerId = getLearningItemOwnerId(item);

    if (domain === 'INSIDIA') {
      this.learningItemsPolicy.canManageInsidia(
        actor,
        { creatorId: ownerId },
        auth,
      );
    } else {
      this.learningItemsPolicy.canManageMitra(
        actor,
        { teacherId: ownerId },
        auth,
      );
    }

    return serializeLearningItem(item);
  }

  async update(
    id: string,
    updateLearningItemDto: UpdateLearningItemDto,
    auth: AuthPayload,
  ) {
    const item = await this.ensureItemExists(id);
    const actorId = this.getActorId(auth);

    // Get actor for authorization
    const actor = await this.userRepository.findRoleByUserId(actorId);
    if (!actor) {
      throw new NotFoundException('User tidak ditemukan');
    }

    // Check authorization based on domain
    const domain = getLearningItemDomain(item);
    const ownerId = getLearningItemOwnerId(item);

    if (domain === 'INSIDIA') {
      this.learningItemsPolicy.canManageInsidia(
        actor,
        { creatorId: ownerId },
        auth,
      );
    } else {
      this.learningItemsPolicy.canManageMitra(
        actor,
        { teacherId: ownerId },
        auth,
      );
    }

    try {
      const updatedItem = await this.learningItemsRepository.update(
        id,
        mapUpdateLearningItemData(updateLearningItemDto),
      );

      return serializeLearningItem(updatedItem);
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async remove(id: string, auth: AuthPayload) {
    const item = await this.ensureItemExists(id);
    const actorId = this.getActorId(auth);

    // Get actor for authorization
    const actor = await this.userRepository.findRoleByUserId(actorId);
    if (!actor) {
      throw new NotFoundException('User tidak ditemukan');
    }

    // Check authorization based on domain
    const domain = getLearningItemDomain(item);
    const ownerId = getLearningItemOwnerId(item);

    if (domain === 'INSIDIA') {
      this.learningItemsPolicy.canManageInsidia(
        actor,
        { creatorId: ownerId },
        auth,
      );
    } else {
      this.learningItemsPolicy.canManageMitra(
        actor,
        { teacherId: ownerId },
        auth,
      );
    }

    const deleted = await this.learningItemsRepository.remove(id);

    if (!deleted) {
      throw new NotFoundException('Learning item tidak ditemukan');
    }

    return { message: 'Learning item berhasil dihapus' };
  }

  async ensureItemExists(id: string) {
    const item = await this.learningItemsRepository.findById(id);

    if (!item) {
      throw new NotFoundException('Learning item tidak ditemukan');
    }

    return item;
  }

  private handlePrismaError(error: unknown): never {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new ConflictException(
        'Urutan learning item sudah digunakan di module ini',
      );
    }

    throw error;
  }
}
