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
  createSemesterSchema,
  type CreateSemesterDto,
  updateSemesterSchema,
  type UpdateSemesterDto,
} from './semester.dto';
import { SemesterService } from './semester.service';

@UseGuards(AccessTokenGuard)
@Controller('mitras/active/academic/semester')
export class SemesterController {
  constructor(private readonly service: SemesterService) {}

  @Post()
  createSemester(
    @Body(new ZodValidationPipe(createSemesterSchema))
    dto: CreateSemesterDto,
    @Req() request: AuthenticatedRequest,
  ) {
    const mitraId = requireActiveMitraId(request);
    return this.service.createSemester(mitraId, dto, request.auth);
  }

  @Get()
  findSemesters(@Req() request: AuthenticatedRequest) {
    const mitraId = requireActiveMitraId(request);
    return this.service.findSemesters(mitraId, request.auth);
  }

  @Get(':id')
  findSemester(
    @Param('id') id: string,
    @Req() request: AuthenticatedRequest,
  ) {
    const mitraId = requireActiveMitraId(request);
    return this.service.findSemester(mitraId, id, request.auth);
  }

  @Patch(':id')
  updateSemester(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateSemesterSchema))
    dto: UpdateSemesterDto,
    @Req() request: AuthenticatedRequest,
  ) {
    const mitraId = requireActiveMitraId(request);
    return this.service.updateSemester(mitraId, id, dto, request.auth);
  }

  @Delete(':id')
  removeSemester(
    @Param('id') id: string,
    @Req() request: AuthenticatedRequest,
  ) {
    const mitraId = requireActiveMitraId(request);
    return this.service.removeSemester(mitraId, id, request.auth);
  }
}
