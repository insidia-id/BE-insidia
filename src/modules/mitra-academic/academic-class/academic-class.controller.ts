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
  createAcademicClassSchema,
  type CreateAcademicClassDto,
  updateAcademicClassSchema,
  type UpdateAcademicClassDto,
} from './academic-class.dto';
import { AcademicClassService } from './academic-class.service';

@UseGuards(AccessTokenGuard)
@Controller('mitras/:mitraId/academic/kelas')
export class AcademicClassController {
  constructor(private readonly service: AcademicClassService) {}

  @Post()
  createAcademicClass(
    @Param('mitraId') mitraId: string,
    @Body(new ZodValidationPipe(createAcademicClassSchema))
    dto: CreateAcademicClassDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.service.createAcademicClass(mitraId, dto, request.auth);
  }

  @Get()
  findAcademicClasses(
    @Param('mitraId') mitraId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.service.findAcademicClasses(mitraId, request.auth);
  }

  @Get(':id')
  findAcademicClass(
    @Param('mitraId') mitraId: string,
    @Param('id') id: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.service.findAcademicClass(mitraId, id, request.auth);
  }

  @Patch(':id')
  updateAcademicClass(
    @Param('mitraId') mitraId: string,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateAcademicClassSchema))
    dto: UpdateAcademicClassDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.service.updateAcademicClass(mitraId, id, dto, request.auth);
  }

  @Delete(':id')
  removeAcademicClass(
    @Param('mitraId') mitraId: string,
    @Param('id') id: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.service.removeAcademicClass(mitraId, id, request.auth);
  }
}
