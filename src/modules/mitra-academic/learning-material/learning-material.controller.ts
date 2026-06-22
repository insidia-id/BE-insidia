import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Put,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  AccessTokenGuard,
  type AuthenticatedRequest,
} from '../../../shared/guards/access-token.guard';
import { requireActiveMitraId } from '../../../shared/session/active-mitra-session';
import { ZodValidationPipe } from '../../../shared/zod/zod-validation.pipe';
import type { UploadedMaterialFile } from './material.types';
import {
  createLearningMaterialSchema,
  learningMaterialListQuerySchema,
  type CreateLearningMaterialDto,
  type LearningMaterialListQueryDto,
  updateLearningMaterialSchema,
  type UpdateLearningMaterialDto,
} from './learning-material.dto';
import { LearningMaterialService } from './learning-material.service';

const materialFileInterceptor = FileInterceptor('file', {
  limits: {
    fileSize: 25 * 1024 * 1024,
  },
});

@UseGuards(AccessTokenGuard)
@Controller('mitras/active/academic/materi')
export class LearningMaterialController {
  constructor(private readonly service: LearningMaterialService) {}

  @Get()
  findLearningMaterials(
    @Query(new ZodValidationPipe(learningMaterialListQuerySchema))
    query: LearningMaterialListQueryDto,
    @Req() request: AuthenticatedRequest,
  ) {
    const mitraId = requireActiveMitraId(request);
    return this.service.findLearningMaterials(mitraId, request.auth, query);
  }

  @Get(':id')
  findLearningMaterial(
    @Param('id') id: string,
    @Req() request: AuthenticatedRequest,
  ) {
    const mitraId = requireActiveMitraId(request);
    return this.service.findLearningMaterial(mitraId, id, request.auth);
  }

  @Post()
  @UseInterceptors(materialFileInterceptor)
  createLearningMaterial(
    @Body(new ZodValidationPipe(createLearningMaterialSchema))
    dto: CreateLearningMaterialDto,
    @UploadedFile() file: UploadedMaterialFile | undefined,
    @Req() request: AuthenticatedRequest,
  ) {
    const mitraId = requireActiveMitraId(request);
    return this.service.createLearningMaterial(
      mitraId,
      dto,
      file,
      request.auth,
    );
  }

  @Put(':id')
  updateLearningMaterial(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateLearningMaterialSchema))
    dto: UpdateLearningMaterialDto,
    @Req() request: AuthenticatedRequest,
  ) {
    const mitraId = requireActiveMitraId(request);
    return this.service.updateLearningMaterial(mitraId, id, dto, request.auth);
  }

  @Delete(':id')
  removeLearningMaterial(
    @Param('id') id: string,
    @Req() request: AuthenticatedRequest,
  ) {
    const mitraId = requireActiveMitraId(request);
    return this.service.removeLearningMaterial(mitraId, id, request.auth);
  }
}
