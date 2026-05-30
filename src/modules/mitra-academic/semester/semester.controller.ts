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
  createSemesterSchema,
  type CreateSemesterDto,
  updateSemesterSchema,
  type UpdateSemesterDto,
} from './semester.dto';
import { SemesterService } from './semester.service';

@UseGuards(AccessTokenGuard)
@Controller('mitras/:mitraId/academic/semester')
export class SemesterController {
  constructor(private readonly service: SemesterService) {}

  @Post()
  createSemester(
    @Param('mitraId') mitraId: string,
    @Body(new ZodValidationPipe(createSemesterSchema))
    dto: CreateSemesterDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.service.createSemester(mitraId, dto, request.auth);
  }

  @Get()
  findSemesters(
    @Param('mitraId') mitraId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.service.findSemesters(mitraId, request.auth);
  }

  @Get(':id')
  findSemester(
    @Param('mitraId') mitraId: string,
    @Param('id') id: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.service.findSemester(mitraId, id, request.auth);
  }

  @Patch(':id')
  updateSemester(
    @Param('mitraId') mitraId: string,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateSemesterSchema))
    dto: UpdateSemesterDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.service.updateSemester(mitraId, id, dto, request.auth);
  }

  @Delete(':id')
  removeSemester(
    @Param('mitraId') mitraId: string,
    @Param('id') id: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.service.removeSemester(mitraId, id, request.auth);
  }
}
