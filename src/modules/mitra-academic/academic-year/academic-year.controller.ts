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
import { AcademicYearService } from './academic-year.service';
import {
  createAcademicYearSchema,
  type CreateAcademicYearDto,
  updateAcademicYearSchema,
  type UpdateAcademicYearDto,
} from './academic-year.dto';

@UseGuards(AccessTokenGuard)
@Controller('mitras/:mitraId/academic/tahun-ajaran')
export class AcademicYearController {
  constructor(private readonly service: AcademicYearService) {}

  @Post()
  createAcademicYear(
    @Param('mitraId') mitraId: string,
    @Body(new ZodValidationPipe(createAcademicYearSchema))
    dto: CreateAcademicYearDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.service.createAcademicYear(mitraId, dto, request.auth);
  }

  @Get()
  findAcademicYears(
    @Param('mitraId') mitraId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.service.findAcademicYears(mitraId, request.auth);
  }

  @Get(':id')
  findAcademicYear(
    @Param('mitraId') mitraId: string,
    @Param('id') id: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.service.findAcademicYear(mitraId, id, request.auth);
  }

  @Patch(':id')
  updateAcademicYear(
    @Param('mitraId') mitraId: string,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateAcademicYearSchema))
    dto: UpdateAcademicYearDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.service.updateAcademicYear(mitraId, id, dto, request.auth);
  }

  @Delete(':id')
  removeAcademicYear(
    @Param('mitraId') mitraId: string,
    @Param('id') id: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.service.removeAcademicYear(mitraId, id, request.auth);
  }
}
