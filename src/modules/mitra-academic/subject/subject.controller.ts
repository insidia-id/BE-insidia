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
  createSubjectSchema,
  type CreateSubjectDto,
  updateSubjectSchema,
  type UpdateSubjectDto,
} from './subject.dto';
import { SubjectService } from './subject.service';

@UseGuards(AccessTokenGuard)
@Controller('mitras/active/academic/mapel')
export class SubjectController {
  constructor(private readonly service: SubjectService) {}

  @Post()
  createSubject(
    @Body(new ZodValidationPipe(createSubjectSchema))
    dto: CreateSubjectDto,
    @Req() request: AuthenticatedRequest,
  ) {
    const mitraId = requireActiveMitraId(request);
    return this.service.createSubject(mitraId, dto, request.auth);
  }

  @Get()
  findSubjects(@Req() request: AuthenticatedRequest) {
    const mitraId = requireActiveMitraId(request);
    return this.service.findSubjects(mitraId, request.auth);
  }

  @Get(':id')
  findSubject(
    @Param('id') id: string,
    @Req() request: AuthenticatedRequest,
  ) {
    const mitraId = requireActiveMitraId(request);
    return this.service.findSubject(mitraId, id, request.auth);
  }

  @Patch(':id')
  updateSubject(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateSubjectSchema))
    dto: UpdateSubjectDto,
    @Req() request: AuthenticatedRequest,
  ) {
    const mitraId = requireActiveMitraId(request);
    return this.service.updateSubject(mitraId, id, dto, request.auth);
  }

  @Delete(':id')
  removeSubject(
    @Param('id') id: string,
    @Req() request: AuthenticatedRequest,
  ) {
    const mitraId = requireActiveMitraId(request);
    return this.service.removeSubject(mitraId, id, request.auth);
  }
}
