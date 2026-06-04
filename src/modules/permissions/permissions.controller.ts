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
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { RoleScope } from '@prisma/client';
import {
  AccessTokenGuard,
  type AuthenticatedRequest,
} from '../../shared/guards/access-token.guard';
import { Roles, RolesGuard } from '../../shared/guards/admin-access.guard';
import { ZodValidationPipe } from '../../shared/zod/zod-validation.pipe';
import { FileInterceptor } from '@nestjs/platform-express';
import { PreviewBulkPermissionUseCase } from './bulk-upload/preview.bulk.modulepermision';
import { EnqueueBulkPermissionImportUseCase } from './bulk-upload/enqueue-bulk-permission-import';
import { type UploadedBulkFile } from 'src/infrastruktur/queue/bullmq/bulk.types';
import {
  type CreateModulePermissionDto,
  createModulePermissionSchema,
  createPermissionSchema,
  type CreatePermissionDto,
} from './dto/create-permission.dto';
import {
  updatePermissionSchema,
  type UpdatePermissionDto,
} from './dto/update-permission.dto';
import { PermissionsService } from './permissions.service';

@UseGuards(AccessTokenGuard, RolesGuard)
@Controller('admin/permissions')
export class PermissionsController {
  constructor(
    private readonly permissionsService: PermissionsService,
    private readonly previewBulkPermissionUseCase: PreviewBulkPermissionUseCase,
    private readonly enqueueBulkPermissionImportUseCase: EnqueueBulkPermissionImportUseCase,
  ) {}
  @Get('modules')
  findAllModulePermissions(
    @Req() request: AuthenticatedRequest,
    @Query('scope') scope: RoleScope,
    @Query('mitraId') mitraId?: string,
  ) {
    return this.permissionsService.findAllModulePermissions(
      request.auth,
      scope,
      mitraId,
    );
  }
  @Post('modules')
  @Roles('SUPER_ADMIN')
  createModulePermission(
    @Body(new ZodValidationPipe(createModulePermissionSchema))
    createModulePermissionDto: CreateModulePermissionDto,
  ) {
    return this.permissionsService.createModulePermission(
      createModulePermissionDto,
    );
  }
  @Patch('modules/:id')
  @Roles('SUPER_ADMIN')
  updateModulePermission(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(createModulePermissionSchema))
    updateModulePermissionDto: CreateModulePermissionDto,
  ) {
    return this.permissionsService.updateModulePermission(
      id,
      updateModulePermissionDto,
    );
  }
  @Delete('modules/:id')
  @Roles('SUPER_ADMIN')
  removeModulePermission(@Param('id') id: string) {
    return this.permissionsService.removeModulePermission(id);
  }

  @Post()
  @Roles('SUPER_ADMIN')
  createPermission(
    @Body(new ZodValidationPipe(createPermissionSchema))
    createPermissionDto: CreatePermissionDto,
  ) {
    return this.permissionsService.createPermission(createPermissionDto);
  }

  @Get(':id')
  findPermissionById(
    @Req() request: AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    return this.permissionsService.findPermissionById(request.auth, id);
  }

  @Patch(':id')
  @Roles('SUPER_ADMIN')
  updatePermission(
    @Req() request: AuthenticatedRequest,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updatePermissionSchema))
    updatePermissionDto: UpdatePermissionDto,
  ) {
    return this.permissionsService.updatePermission(
      request.auth,
      id,
      updatePermissionDto,
    );
  }

  @Delete(':id')
  @Roles('SUPER_ADMIN')
  removePermission(
    @Req() request: AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    return this.permissionsService.removePermission(request.auth, id);
  }

  @Post('modules/preview')
  @UseInterceptors(FileInterceptor('file'))
  preview(
    @Req() request: AuthenticatedRequest,
    @UploadedFile() file: UploadedBulkFile,
  ) {
    return this.previewBulkPermissionUseCase.execute(file, request.auth);
  }

  @Post('modules/import/:jobId')
  import(@Req() request: AuthenticatedRequest, @Param('jobId') jobId: string) {
    return this.enqueueBulkPermissionImportUseCase.execute(jobId, request.auth);
  }
}
