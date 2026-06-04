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
    @Query('scope') scope?: 'INSIDIA' | 'MITRA',
    @Query('filter') filter?: 'all' | 'available' | 'deleted',
    @Query('mitraId') mitraId?: string,
  ) {
    return this.userService.findAll({
      scope: scope ?? 'INSIDIA',
      filter,
      mitraId,
      auth: request.auth,
    });
  }
  @Get(':id')
  findOne(
    @Req() request: AuthenticatedRequest,
    @Param('id') id: string,
    @Query('scope') scope?: 'INSIDIA' | 'MITRA',
    @Query('mitraId') mitraId?: string,
  ) {
    return this.userService.findOne(
      id,
      request.auth,
      scope ?? 'INSIDIA',
      mitraId,
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
    @Query('mitraId') mitraId?: string,
  ) {
    console.log('Deleting user', { id, scope, mitraId });
    return this.userService.remove(
      id,
      request.auth,
      scope ?? 'INSIDIA',
      mitraId,
    );
  }
  @Delete(':id/mitra-roles')
  deleteUserMitraRoles(
    @Req() request: AuthenticatedRequest,
    @Param('id') userId: string,
    @Query('mitraId') mitraId: string,
  ) {
    console.log('Deleting mitra roles for user', { userId, mitraId });
    return this.userService.deleteUserMitraRoles(request.auth, userId, mitraId);
  }
  @Post('preview')
  @UseInterceptors(FileInterceptor('file'))
  preview(
    @Req() request: AuthenticatedRequest,
    @UploadedFile() file: UploadedBulkFile,
  ) {
    return this.previewBulkUserUseCase.execute(file, request.auth);
  }

  @Post('import/:jobId')
  import(@Req() request: AuthenticatedRequest, @Param('jobId') jobId: string) {
    return this.enqueueBulkUserImportUseCase.execute(jobId, request.auth);
  }
}
