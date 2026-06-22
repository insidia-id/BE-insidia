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
import { requireActiveMitraId } from '../../../shared/session/active-mitra-session';
import { ZodValidationPipe } from '../../../shared/zod/zod-validation.pipe';
import {
  createCurriculumSchema,
  type CreateCurriculumDto,
  updateCurriculumSchema,
  type UpdateCurriculumDto,
} from './curriculum.dto';
import { CurriculumService } from './curriculum.service';

@UseGuards(AccessTokenGuard)
@Controller('mitras/active/academic/kurikulum')
export class CurriculumController {
  constructor(private readonly service: CurriculumService) {}

  @Post()
  createCurriculum(
    @Body(new ZodValidationPipe(createCurriculumSchema))
    dto: CreateCurriculumDto,
    @Req() request: AuthenticatedRequest,
  ) {
    const mitraId = requireActiveMitraId(request);
    return this.service.createCurriculum(mitraId, dto, request.auth);
  }

  @Get()
  findCurricula(@Req() request: AuthenticatedRequest) {
    const mitraId = requireActiveMitraId(request);
    return this.service.findCurricula(mitraId, request.auth);
  }

  @Get(':id')
  findCurriculum(
    @Param('id') id: string,
    @Req() request: AuthenticatedRequest,
  ) {
    const mitraId = requireActiveMitraId(request);
    return this.service.findCurriculum(mitraId, id, request.auth);
  }

  @Patch(':id')
  updateCurriculum(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateCurriculumSchema))
    dto: UpdateCurriculumDto,
    @Req() request: AuthenticatedRequest,
  ) {
    const mitraId = requireActiveMitraId(request);
    return this.service.updateCurriculum(mitraId, id, dto, request.auth);
  }

  @Delete(':id')
  removeCurriculum(
    @Param('id') id: string,
    @Req() request: AuthenticatedRequest,
  ) {
    const mitraId = requireActiveMitraId(request);
    return this.service.removeCurriculum(mitraId, id, request.auth);
  }
}
