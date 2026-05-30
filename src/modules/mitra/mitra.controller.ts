import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import {
  AccessTokenGuard,
  type AuthenticatedRequest,
} from '../../shared/guards/access-token.guard';
import { Roles, RolesGuard } from '../../shared/guards/admin-access.guard';
import { ZodValidationPipe } from '../../shared/zod/zod-validation.pipe';
import {
  createMitraMemberSchema,
  type CreateMitraMemberDto,
} from './dto/create-mitra-member.dto';
import { createMitraSchema, type CreateMitraDto } from './dto/create-mitra.dto';
import { updateMitraSchema, type UpdateMitraDto } from './dto/update-mitra.dto';
import { MitraService } from './mitra.service';
import type { MitraFilter } from './mitra.types';

@UseGuards(AccessTokenGuard, RolesGuard)
@Controller('admin/mitras')
export class MitraController {
  constructor(private readonly mitraService: MitraService) {}

  @Post()
  create(
    @Req() request: AuthenticatedRequest,
    @Body(new ZodValidationPipe(createMitraSchema))
    createMitraDto: CreateMitraDto,
  ) {
    return this.mitraService.create(request.auth, createMitraDto);
  }

  @Get()
  findAll(
    @Req() request: AuthenticatedRequest,
    @Query('filter') filter: MitraFilter = 'available',
    @Query('keyword') keyword?: string,
  ) {
    return this.mitraService.findAll(request.auth, filter, keyword);
  }

  @Get(':id')
  findOne(@Req() request: AuthenticatedRequest, @Param('id') id: string) {
    return this.mitraService.findOne(request.auth, id);
  }

  @Patch(':id')
  update(
    @Req() request: AuthenticatedRequest,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateMitraSchema))
    updateMitraDto: UpdateMitraDto,
  ) {
    return this.mitraService.update(request.auth, id, updateMitraDto);
  }

  @Delete(':id')
  remove(@Req() request: AuthenticatedRequest, @Param('id') id: string) {
    return this.mitraService.remove(request.auth, id);
  }

  @Get(':id/members')
  findMembers(@Req() request: AuthenticatedRequest, @Param('id') id: string) {
    return this.mitraService.findMembers(request.auth, id);
  }

  @Post(':id/members')
  assignMember(
    @Req() request: AuthenticatedRequest,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(createMitraMemberSchema))
    createMitraMemberDto: CreateMitraMemberDto,
  ) {
    return this.mitraService.assignMember(
      request.auth,
      id,
      createMitraMemberDto,
    );
  }

  @Delete(':id/members/:memberId')
  removeMember(
    @Req() request: AuthenticatedRequest,
    @Param('id') id: string,
    @Param('memberId') memberId: string,
  ) {
    return this.mitraService.removeMember(request.auth, id, memberId);
  }
}
