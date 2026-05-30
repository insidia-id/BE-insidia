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
  createSubjectSchema,
  type CreateSubjectDto,
  updateSubjectSchema,
  type UpdateSubjectDto,
} from './subject.dto';
import { SubjectService } from './subject.service';

@UseGuards(AccessTokenGuard)
@Controller('mitras/:mitraId/academic/mapel')
export class SubjectController {
  constructor(private readonly service: SubjectService) {}

  @Post()
  createSubject(
    @Param('mitraId') mitraId: string,
    @Body(new ZodValidationPipe(createSubjectSchema))
    dto: CreateSubjectDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.service.createSubject(mitraId, dto, request.auth);
  }

  @Get()
  findSubjects(
    @Param('mitraId') mitraId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.service.findSubjects(mitraId, request.auth);
  }

  @Get(':id')
  findSubject(
    @Param('mitraId') mitraId: string,
    @Param('id') id: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.service.findSubject(mitraId, id, request.auth);
  }

  @Patch(':id')
  updateSubject(
    @Param('mitraId') mitraId: string,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateSubjectSchema))
    dto: UpdateSubjectDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.service.updateSubject(mitraId, id, dto, request.auth);
  }

  @Delete(':id')
  removeSubject(
    @Param('mitraId') mitraId: string,
    @Param('id') id: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.service.removeSubject(mitraId, id, request.auth);
  }
}
