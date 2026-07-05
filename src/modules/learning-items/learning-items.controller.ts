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
  createLearningItemSchema,
  type CreateLearningItemDto,
} from './dto/create-learning-item.dto';
import {
  updateLearningItemSchema,
  type UpdateLearningItemDto,
} from './dto/update-learning-item.dto';
import { LearningItemsService } from './learning-items.service';

@UseGuards(AccessTokenGuard)
@Controller('admin')
export class LearningItemsController {
  constructor(private readonly learningItemsService: LearningItemsService) {}

  @Post('modules/:moduleId/learning-items')
  create(
    @Param('moduleId') moduleId: string,
    @Body(new ZodValidationPipe(createLearningItemSchema))
    createLearningItemDto: CreateLearningItemDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.learningItemsService.create(
      moduleId,
      createLearningItemDto,
      request.auth,
    );
  }

  @Get('modules/:moduleId/learning-items')
  findByModuleId(
    @Param('moduleId') moduleId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.learningItemsService.findByModuleId(moduleId, request.auth);
  }

  @Get('learning-items/:id')
  findOne(@Param('id') id: string, @Req() request: AuthenticatedRequest) {
    return this.learningItemsService.findOne(id, request.auth);
  }

  @Patch('learning-items/:id')
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateLearningItemSchema))
    updateLearningItemDto: UpdateLearningItemDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.learningItemsService.update(
      id,
      updateLearningItemDto,
      request.auth,
    );
  }

  @Delete('learning-items/:id')
  remove(@Param('id') id: string, @Req() request: AuthenticatedRequest) {
    return this.learningItemsService.remove(id, request.auth);
  }
}
