import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  AccessTokenGuard,
  type AuthenticatedRequest,
} from '../../shared/guards/access-token.guard';
import { ZodValidationPipe } from '../../shared/zod/zod-validation.pipe';
import {
  createLessonSchema,
  type CreateLessonDto,
} from './dto/create-lesson.dto';
import {
  updateLessonSchema,
  type UpdateLessonDto,
} from './dto/update-lesson.dto';
import { LessonsService } from './lessons.service';

@UseGuards(AccessTokenGuard)
@Controller('admin')
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  @Post('modules/:moduleId/lessons')
  create(
    @Param('moduleId') moduleId: string,
    @Body(new ZodValidationPipe(createLessonSchema))
    createLessonDto: CreateLessonDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.lessonsService.create(moduleId, createLessonDto, request);
  }

  @Get('learning-items/:learningItemId/lessons')
  findByLearningItemId(
    @Param('learningItemId') learningItemId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.lessonsService.findByLearningItemId(learningItemId, request);
  }

  @Patch('learning-items/:learningItemId/lessons')
  update(
    @Param('learningItemId') learningItemId: string,
    @Body(new ZodValidationPipe(updateLessonSchema))
    updateLessonDto: UpdateLessonDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.lessonsService.update(learningItemId, updateLessonDto, request);
  }

  @Delete('learning-items/:learningItemId/lessons/:id')
  remove(
    @Param('learningItemId') learningItemId: string,
    @Param('id') id: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.lessonsService.remove(learningItemId, id, request);
  }
}
