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
  createClassGroupSchema,
  type CreateClassGroupDto,
  updateClassGroupSchema,
  type UpdateClassGroupDto,
} from './class-group.dto';
import { ClassGroupService } from './class-group.service';

@UseGuards(AccessTokenGuard)
@Controller('mitras/:mitraId/academic/rombel')
export class ClassGroupController {
  constructor(private readonly service: ClassGroupService) {}

  @Post()
  createClassGroup(
    @Param('mitraId') mitraId: string,
    @Body(new ZodValidationPipe(createClassGroupSchema))
    dto: CreateClassGroupDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.service.createClassGroup(mitraId, dto, request.auth);
  }

  @Get()
  findClassGroups(
    @Param('mitraId') mitraId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.service.findClassGroups(mitraId, request.auth);
  }

  @Get(':id')
  findClassGroup(
    @Param('mitraId') mitraId: string,
    @Param('id') id: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.service.findClassGroup(mitraId, id, request.auth);
  }

  @Patch(':id')
  updateClassGroup(
    @Param('mitraId') mitraId: string,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateClassGroupSchema))
    dto: UpdateClassGroupDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.service.updateClassGroup(mitraId, id, dto, request.auth);
  }

  @Delete(':id')
  removeClassGroup(
    @Param('mitraId') mitraId: string,
    @Param('id') id: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.service.removeClassGroup(mitraId, id, request.auth);
  }
}
