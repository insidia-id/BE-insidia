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
import { requireActiveMitraId } from '../../shared/session/active-mitra-session';
import { ZodValidationPipe } from '../../shared/zod/zod-validation.pipe';
import {
  createCurriculumSchema,
  type CreateCurriculumDto,
  updateCurriculumSchema,
  type UpdateCurriculumDto,
} from './dto/curriculum.dto';
import { CurriculumService } from './curriculum.service';

@UseGuards(AccessTokenGuard)
@Controller('mitras')
export class CurriculumController {
  constructor(private readonly service: CurriculumService) {}

  @Post('/:mitraId/curriculum')
  createCurriculum(
    @Param('mitraId') mitraId: string,
    @Body(new ZodValidationPipe(createCurriculumSchema))
    dto: CreateCurriculumDto,
    @Req() request: AuthenticatedRequest,
  ) {
    const activeMitraId = requireActiveMitraId(request, mitraId);
    return this.service.createCurriculum(activeMitraId, dto, request);
  }

  @Get('/:mitraId/curriculum')
  findCurricula(
    @Param('mitraId') mitraId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    const activeMitraId = requireActiveMitraId(request, mitraId);
    return this.service.findCurricula(activeMitraId, request);
  }

  @Get('/:mitraId/curriculum/:id')
  findCurriculum(
    @Param('id') id: string,
    @Param('mitraId') mitraId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    const activeMitraId = requireActiveMitraId(request, mitraId);
    return this.service.findCurriculum(activeMitraId, id, request);
  }

  @Patch('/:mitraId/curriculum/:id')
  updateCurriculum(
    @Param('id') id: string,
    @Param('mitraId') mitraId: string,
    @Body(new ZodValidationPipe(updateCurriculumSchema))
    dto: UpdateCurriculumDto,
    @Req() request: AuthenticatedRequest,
  ) {
    const activeMitraId = requireActiveMitraId(request, mitraId);
    return this.service.updateCurriculum(activeMitraId, id, dto, request);
  }

  @Delete('/:mitraId/curriculum/:id')
  removeCurriculum(
    @Param('id') id: string,
    @Param('mitraId') mitraId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    const activeMitraId = requireActiveMitraId(request, mitraId);
    return this.service.removeCurriculum(activeMitraId, id, request);
  }
}
