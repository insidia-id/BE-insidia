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
import { AcademicYearService } from './academic-year.service';
import {
  createAcademicYearSchema,
  type CreateAcademicYearDto,
  updateAcademicYearSchema,
  type UpdateAcademicYearDto,
} from './academic-year.dto';

@UseGuards(AccessTokenGuard)
@Controller('mitras/active/academic/tahun-ajaran')
export class AcademicYearController {
  constructor(private readonly service: AcademicYearService) {}

  @Post()
  createAcademicYear(
    @Body(new ZodValidationPipe(createAcademicYearSchema))
    dto: CreateAcademicYearDto,
    @Req() request: AuthenticatedRequest,
  ) {
    const mitraId = requireActiveMitraId(request);
    return this.service.createAcademicYear(mitraId, dto, request.auth);
  }

  @Get()
  findAcademicYears(@Req() request: AuthenticatedRequest) {
    const mitraId = requireActiveMitraId(request);
    return this.service.findAcademicYears(mitraId, request.auth);
  }

  @Get(':id')
  findAcademicYear(
    @Param('id') id: string,
    @Req() request: AuthenticatedRequest,
  ) {
    const mitraId = requireActiveMitraId(request);
    return this.service.findAcademicYear(mitraId, id, request.auth);
  }

  @Patch(':id')
  updateAcademicYear(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateAcademicYearSchema))
    dto: UpdateAcademicYearDto,
    @Req() request: AuthenticatedRequest,
  ) {
    const mitraId = requireActiveMitraId(request);
    return this.service.updateAcademicYear(mitraId, id, dto, request.auth);
  }

  @Delete(':id')
  removeAcademicYear(
    @Param('id') id: string,
    @Req() request: AuthenticatedRequest,
  ) {
    const mitraId = requireActiveMitraId(request);
    return this.service.removeAcademicYear(mitraId, id, request.auth);
  }
}
