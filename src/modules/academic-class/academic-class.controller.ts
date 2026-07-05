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
  createAcademicClassSchema,
  type CreateAcademicClassDto,
  updateAcademicClassSchema,
  type UpdateAcademicClassDto,
} from './dto/academic-class.dto';
import { AcademicClassService } from './academic-class.service';

@UseGuards(AccessTokenGuard)
@Controller('mitras')
export class AcademicClassController {
  constructor(private readonly service: AcademicClassService) {}

  @Post(':mitraId/class')
  createAcademicClass(
    @Body(new ZodValidationPipe(createAcademicClassSchema))
    dto: CreateAcademicClassDto,
    @Req() request: AuthenticatedRequest,
  ) {
    const mitraId = requireActiveMitraId(request);
    return this.service.createAcademicClass(mitraId, dto, request);
  }

  @Get(':mitraId/class')
  findAcademicClasses(@Req() request: AuthenticatedRequest) {
    const mitraId = requireActiveMitraId(request);
    return this.service.findAcademicClasses(mitraId, request);
  }

  @Get(':mitraId/class/:id')
  findAcademicClass(
    @Param('id') id: string,
    @Req() request: AuthenticatedRequest,
  ) {
    const mitraId = requireActiveMitraId(request);
    return this.service.findAcademicClass(mitraId, id, request);
  }

  @Patch(':mitraId/class/:id')
  updateAcademicClass(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateAcademicClassSchema))
    dto: UpdateAcademicClassDto,
    @Req() request: AuthenticatedRequest,
  ) {
    const mitraId = requireActiveMitraId(request);
    return this.service.updateAcademicClass(mitraId, id, dto, request);
  }

  @Delete(':mitraId/class/:id')
  removeAcademicClass(
    @Param('id') id: string,
    @Req() request: AuthenticatedRequest,
  ) {
    const mitraId = requireActiveMitraId(request);
    return this.service.removeAcademicClass(mitraId, id, request);
  }
}
