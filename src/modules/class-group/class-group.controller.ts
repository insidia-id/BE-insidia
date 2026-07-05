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
  createClassGroupSchema,
  type CreateClassGroupDto,
  updateClassGroupSchema,
  type UpdateClassGroupDto,
} from './dto/class-group.dto';
import { ClassGroupService } from './class-group.service';

@UseGuards(AccessTokenGuard)
@Controller('mitras')
export class ClassGroupController {
  constructor(private readonly service: ClassGroupService) {}

  @Post(':mitraId/class-group')
  createClassGroup(
    @Body(new ZodValidationPipe(createClassGroupSchema))
    dto: CreateClassGroupDto,
    @Req() request: AuthenticatedRequest,
  ) {
    const mitraId = requireActiveMitraId(request);
    return this.service.createClassGroup(mitraId, dto, request);
  }

  @Get(':mitraId/class-group')
  findClassGroups(@Req() request: AuthenticatedRequest) {
    const mitraId = requireActiveMitraId(request);
    return this.service.findClassGroups(mitraId, request);
  }

  @Get(':mitraId/class-group/:id')
  findClassGroup(
    @Param('id') id: string,
    @Req() request: AuthenticatedRequest,
  ) {
    const mitraId = requireActiveMitraId(request);
    return this.service.findClassGroup(mitraId, id, request);
  }

  @Patch(':mitraId/class-group/:id')
  updateClassGroup(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateClassGroupSchema))
    dto: UpdateClassGroupDto,
    @Req() request: AuthenticatedRequest,
  ) {
    const mitraId = requireActiveMitraId(request);
    return this.service.updateClassGroup(mitraId, id, dto, request);
  }

  @Delete(':mitraId/class-group/:id')
  removeClassGroup(
    @Param('id') id: string,
    @Req() request: AuthenticatedRequest,
  ) {
    const mitraId = requireActiveMitraId(request);
    return this.service.removeClassGroup(mitraId, id, request);
  }
}
