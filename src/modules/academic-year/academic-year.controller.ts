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
import { AcademicYearService } from './academic-year.service';
import {
  createAcademicYearSchema,
  type CreateAcademicYearDto,
  updateAcademicYearSchema,
  type UpdateAcademicYearDto,
} from './dto/academic-year.dto';

@UseGuards(AccessTokenGuard)
@Controller('mitras')
export class AcademicYearController {
  constructor(private readonly service: AcademicYearService) {}

  @Post('/:mitraId/tahun-ajaran')
  createAcademicYear(
    @Body(new ZodValidationPipe(createAcademicYearSchema))
    dto: CreateAcademicYearDto,
    @Req() request: AuthenticatedRequest,
    @Param('mitraId') mitraId: string,
  ) {
    const activeMitraId = requireActiveMitraId(request, mitraId);
    return this.service.createAcademicYear(activeMitraId, dto, request);
  }

  @Get('/:mitraId/tahun-ajaran')
  findAcademicYears(@Req() request: AuthenticatedRequest) {
    const activeMitraId = requireActiveMitraId(request);
    return this.service.findAcademicYears(activeMitraId, request);
  }

  @Get('/:mitraId/tahun-ajaran/:id')
  findAcademicYear(
    @Param('id') id: string,
    @Req() request: AuthenticatedRequest,
  ) {
    const activeMitraId = requireActiveMitraId(request);
    return this.service.findAcademicYear(activeMitraId, id, request);
  }

  @Patch('/:mitraId/tahun-ajaran/:id')
  updateAcademicYear(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateAcademicYearSchema))
    dto: UpdateAcademicYearDto,
    @Req() request: AuthenticatedRequest,
  ) {
    const activeMitraId = requireActiveMitraId(request);
    return this.service.updateAcademicYear(activeMitraId, id, dto, request);
  }

  @Delete('/:mitraId/tahun-ajaran/:id')
  removeAcademicYear(
    @Param('id') id: string,
    @Req() request: AuthenticatedRequest,
  ) {
    const activeMitraId = requireActiveMitraId(request);
    return this.service.removeAcademicYear(activeMitraId, id, request);
  }
}
