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
} from '../../../shared/guards/access-token.guard';
import { ZodValidationPipe } from '../../../shared/zod/zod-validation.pipe';
import {
  createCurriculumSchema,
  type CreateCurriculumDto,
  updateCurriculumSchema,
  type UpdateCurriculumDto,
} from './curriculum.dto';
import { CurriculumService } from './curriculum.service';

@UseGuards(AccessTokenGuard)
@Controller('mitras/:mitraId/academic/kurikulum')
export class CurriculumController {
  constructor(private readonly service: CurriculumService) {}

  @Post()
  createCurriculum(
    @Param('mitraId') mitraId: string,
    @Body(new ZodValidationPipe(createCurriculumSchema))
    dto: CreateCurriculumDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.service.createCurriculum(mitraId, dto, request.auth);
  }

  @Get()
  findCurricula(
    @Param('mitraId') mitraId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.service.findCurricula(mitraId, request.auth);
  }

  @Get(':id')
  findCurriculum(
    @Param('mitraId') mitraId: string,
    @Param('id') id: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.service.findCurriculum(mitraId, id, request.auth);
  }

  @Patch(':id')
  updateCurriculum(
    @Param('mitraId') mitraId: string,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateCurriculumSchema))
    dto: UpdateCurriculumDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.service.updateCurriculum(mitraId, id, dto, request.auth);
  }

  @Delete(':id')
  removeCurriculum(
    @Param('mitraId') mitraId: string,
    @Param('id') id: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.service.removeCurriculum(mitraId, id, request.auth);
  }
}
