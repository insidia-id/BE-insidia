import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { AuthPayload } from '../auth/auth.types';
import { UserRepository } from '../user/user.repository';
import type { CreateLessonDto } from './dto/create-lesson.dto';
import type { UpdateLessonDto } from './dto/update-lesson.dto';
import {
  mapCreateLessonData,
  mapUpdateLessonData,
  serializeLesson,
} from './lessons.mapper';
import { LessonsPolicy } from './lessons.policy';
import { LessonsRepository } from './lessons.repository';
import { LearningItemsService } from '../learning-items/learning-items.service';
import { AuthenticatedRequest } from 'src/shared/guards/access-token.guard';
@Injectable()
export class LessonsService {
  constructor(
    private readonly lessonsRepository: LessonsRepository,
    private readonly LearningItemsService: LearningItemsService,
  ) {}

  async create(
    moduleId: string,
    createLessonDto: CreateLessonDto,
    request: AuthenticatedRequest,
  ) {
    await this.LearningItemsService.ValidateLearningItemOwnership(
      moduleId,
      request,
    );

    if (createLessonDto.type !== 'LESSON') {
      throw new BadRequestException(
        'Learning item harus bertipe LESSON untuk membuat lesson',
      );
    }

    try {
      const lesson = await this.lessonsRepository.create(
        moduleId,
        mapCreateLessonData(createLessonDto),
      );

      return lesson;
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async findByLearningItemId(
    learningItemId: string,
    request: AuthenticatedRequest,
  ) {
    const learningItem =
      await this.LearningItemsService.ensureAcessToLearningItem(
        learningItemId,
        request,
      );

    const lesson = await this.lessonsRepository.findByLearningItemId(
      learningItem.id,
    );
    if (!lesson) {
      throw new NotFoundException('Lesson tidak ditemukan');
    }
    return serializeLesson(learningItem, lesson);
  }

  async update(
    learningItemId: string,
    updateLessonDto: UpdateLessonDto,
    request: AuthenticatedRequest,
  ) {
    const learningItem =
      await this.LearningItemsService.ensureCanManageLearningItem(
        learningItemId,
        request,
      );

    try {
      const updatedLesson = await this.lessonsRepository.update(
        learningItemId,
        mapUpdateLessonData(updateLessonDto),
      );

      return serializeLesson(learningItem, updatedLesson);
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async remove(
    learningItemId: string,
    id: string,
    request: AuthenticatedRequest,
  ) {
    await this.LearningItemsService.ensureCanManageLearningItem(
      learningItemId,
      request,
    );
    await this.ensureLessonExists(id);

    const deleted = await this.lessonsRepository.softDelete(id);

    if (!deleted) {
      throw new NotFoundException('Lesson tidak ditemukan');
    }

    return { message: 'Lesson berhasil dihapus' };
  }

  async ensureLessonExists(id: string) {
    const lesson = await this.lessonsRepository.findById(id);

    if (!lesson) {
      throw new NotFoundException('Lesson tidak ditemukan');
    }

    return lesson;
  }

  private handlePrismaError(error: unknown): never {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new BadRequestException(
        'urutan learning item atau slug sudah digunakan',
      );
    }

    throw error;
  }
}
