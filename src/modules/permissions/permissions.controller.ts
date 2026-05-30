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
} from '@nestjs/common';
import { RoleScope } from '@prisma/client';
import {
  AccessTokenGuard,
  type AuthenticatedRequest,
} from '../../shared/guards/access-token.guard';
import { Roles, RolesGuard } from '../../shared/guards/admin-access.guard';
import { ZodValidationPipe } from '../../shared/zod/zod-validation.pipe';
import {
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
  constructor(private readonly permissionsService: PermissionsService) {}

  @Get()
  findAllPermissions(
    @Req() request: AuthenticatedRequest,
    @Query('scope') scope: RoleScope,
    @Query('mitraId') mitraId?: string,
  ) {
    return this.permissionsService.findAllPermissions(
      request.auth,
      scope,
      mitraId,
    );
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
}
