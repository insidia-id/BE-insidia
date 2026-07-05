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
  createSemesterSchema,
  type CreateSemesterDto,
  updateSemesterSchema,
  type UpdateSemesterDto,
} from './dto/semester.dto';
import { SemesterService } from './semester.service';

@UseGuards(AccessTokenGuard)
@Controller('mitras')
export class SemesterController {
  constructor(private readonly service: SemesterService) {}

  @Post('/:mitraId/semesters')
  createSemester(
    @Param('mitraId')
    mitraId: string,
    @Body(new ZodValidationPipe(createSemesterSchema))
    dto: CreateSemesterDto,
    @Req() request: AuthenticatedRequest,
  ) {
    const activeMitraId = requireActiveMitraId(request, mitraId);
    return this.service.createSemester(activeMitraId, dto, request);
  }

  @Get('/:mitraId/semesters')
  findSemesters(
    @Req() request: AuthenticatedRequest,
    @Param('mitraId') mitraId: string,
  ) {
    const activeMitraId = requireActiveMitraId(request, mitraId);
    const response = this.service.findSemesters(activeMitraId, request);
    return response;
  }

  @Get('/:mitraId/semesters/:id')
  findSemester(
    @Param('id') id: string,
    @Req() request: AuthenticatedRequest,
    @Param('mitraId') mitraId: string,
  ) {
    const activeMitraId = requireActiveMitraId(request, mitraId);
    return this.service.findSemester(activeMitraId, id, request);
  }

  @Patch('/:mitraId/semesters/:id')
  updateSemester(
    @Param('id') id: string,
    @Param('mitraId') mitraId: string,
    @Body(new ZodValidationPipe(updateSemesterSchema))
    dto: UpdateSemesterDto,
    @Req() request: AuthenticatedRequest,
  ) {
    const activeMitraId = requireActiveMitraId(request, mitraId);
    return this.service.updateSemester(activeMitraId, id, dto, request);
  }

  @Delete('/:mitraId/semesters/:id')
  removeSemester(
    @Param('id') id: string,
    @Req() request: AuthenticatedRequest,
    @Param('mitraId') mitraId: string,
  ) {
    const activeMitraId = requireActiveMitraId(request, mitraId);
    return this.service.removeSemester(activeMitraId, id, request);
  }
}
