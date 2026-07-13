import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';

import { UserService } from './user.service';

import { createUserSchema, type CreateUserDto } from './dto/create-user.dto';

import { updateUserSchema, type UpdateUserDto } from './dto/update-user.dto';

import { ZodValidationPipe } from '../../shared/zod/zod-validation.pipe';

import { RolesGuard } from '../../shared/guards/admin-access.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { PreviewBulkUserUseCase } from './bulk-upload/preview-bulk-user';
import { EnqueueBulkUserImportUseCase } from './bulk-upload/enqueue-bulk-user-import';
import {
  AccessTokenGuard,
  type AuthenticatedRequest,
} from '../../shared/guards/access-token.guard';
import { type UploadedBulkFile } from 'src/infrastruktur/queue/bullmq/bulk.types';
import { type RoleCode } from '../../shared/types/types';
import {
  paginationQuerySchema,
  type PaginationQuery,
} from '../../shared/zod/zod.schemas';
@UseGuards(AccessTokenGuard, RolesGuard)
@Controller('admin/user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly previewBulkUserUseCase: PreviewBulkUserUseCase,
    private readonly enqueueBulkUserImportUseCase: EnqueueBulkUserImportUseCase,
  ) {}

  @Post()
  create(
    @Body(new ZodValidationPipe(createUserSchema))
    createUserDto: CreateUserDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.userService.create(createUserDto, request.auth);
  }

  @Get()
  findAll(
    @Req() request: AuthenticatedRequest,
    @Query(new ZodValidationPipe(paginationQuerySchema))
    pagination: PaginationQuery,
    @Query('scope') scope?: 'INSIDIA' | 'MITRA',
    @Query('filter') filter?: 'all' | 'available' | 'deleted',
    @Query('roleCode') roleCode?: RoleCode,
  ) {
    const result = this.userService.findAll({
      auth: request.auth,
      session: request.session,
      pagination,
      scope: scope ?? 'INSIDIA',
      filter,
      roleCode,
    });
    return result;
  }
  @Get(':id')
  findOne(
    @Req() request: AuthenticatedRequest,
    @Param('id') id: string,
    @Query('scope') scope?: 'INSIDIA' | 'MITRA',
  ) {
    return this.userService.findOne(
      id,
      request.auth,
      scope ?? 'INSIDIA',
      request.session,
    );
  }

  @Patch(':id')
  update(
    @Param('id') id: string,

    @Body(new ZodValidationPipe(updateUserSchema))
    updateUserDto: UpdateUserDto,

    @Req() request: AuthenticatedRequest,
  ) {
    return this.userService.update(id, updateUserDto, request.auth);
  }

  @Delete(':id')
  remove(
    @Req() request: AuthenticatedRequest,
    @Param('id') id: string,
    @Query('scope') scope?: 'INSIDIA' | 'MITRA',
  ) {
    return this.userService.remove(
      id,
      request.auth,
      scope ?? 'INSIDIA',
      request.session,
    );
  }

  @Delete(':id/mitra-roles/:mitraId')
  deleteUserMitraRoles(
    @Req() request: AuthenticatedRequest,
    @Param('id') userId: string,
    @Param(`mitraId`) mitraId: string,
  ) {
    return this.userService.deleteUserMitraRoles(
      request.auth,
      userId,
      request.session,
      mitraId,
    );
  }
  @Post(':id/switch-mitra')
  switchMitra(@Param('id') userId: string, @Body('mitraId') mitraId: string) {
    return this.userService.switchMitra(userId, mitraId);
  }

  @Post('preview')
  @UseInterceptors(FileInterceptor('file'))
  preview(
    @Req() request: AuthenticatedRequest,
    @UploadedFile() file: UploadedBulkFile,
  ) {
    return this.previewBulkUserUseCase.execute(file, request);
  }

  @Post('import/:jobId')
  import(@Req() request: AuthenticatedRequest, @Param('jobId') jobId: string) {
    return this.enqueueBulkUserImportUseCase.execute(jobId, request);
  }
}
