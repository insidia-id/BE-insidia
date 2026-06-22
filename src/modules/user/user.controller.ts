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
  Res,
  UseGuards,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import type { Response } from 'express';

import { UserService } from './user.service';

import { createUserSchema, type CreateUserDto } from './dto/create-user.dto';

import { updateUserSchema, type UpdateUserDto } from './dto/update-user.dto';

import { ZodValidationPipe } from '../../shared/zod/zod-validation.pipe';

import { RolesGuard } from '../../shared/guards/admin-access.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { PreviewBulkUserUseCase } from './bulk-upload/preview-bulk-user';
import { EnqueueBulkUserImportUseCase } from './bulk-upload/enqueue-bulk-user-import';
import { BulkUserTemplateGeneratorService } from './bulk-upload/bulk-user-template-generator.service';
import {
  AccessTokenGuard,
  type AuthenticatedRequest,
} from '../../shared/guards/access-token.guard';
import { type UploadedBulkFile } from 'src/infrastruktur/queue/bullmq/bulk.types';
import { type RoleCode } from './user.types';
@UseGuards(AccessTokenGuard, RolesGuard)
@Controller('admin/user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly previewBulkUserUseCase: PreviewBulkUserUseCase,
    private readonly enqueueBulkUserImportUseCase: EnqueueBulkUserImportUseCase,
    private readonly templateGenerator: BulkUserTemplateGeneratorService,
  ) {}

  @Post()
  create(
    @Body(new ZodValidationPipe(createUserSchema))
    createUserDto: CreateUserDto,
    @Req() request: AuthenticatedRequest,
  ) {
    console.log('createUserDto controller:', createUserDto);
    return this.userService.create(createUserDto, request.auth);
  }

  @Get()
  findAll(
    @Req() request: AuthenticatedRequest,
    @Query('scope') scope?: 'INSIDIA' | 'MITRA',
    @Query('filter') filter?: 'all' | 'available' | 'deleted',
    @Query('roleCode') roleCode?: RoleCode,
  ) {
    const result = this.userService.findAll({
      auth: request.auth,
      session: request.session,
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

  @Get('bulk-upload/template/:roleCode')
  downloadTemplate(@Param('roleCode') roleCode: string, @Res() res: Response) {
    if (!this.templateGenerator.isValidRoleCode(roleCode)) {
      throw new BadRequestException(
        'Role code tidak valid. Gunakan: GURU, MURID, WALI_MURID, atau AKADEMIK',
      );
    }

    const csvContent = this.templateGenerator.generateTemplate(roleCode);
    const filename = this.templateGenerator.getTemplateFilename(roleCode);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csvContent);
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
    return this.enqueueBulkUserImportUseCase.execute(jobId, request.auth);
  }
}
