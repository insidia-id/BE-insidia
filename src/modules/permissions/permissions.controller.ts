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
} from '@nestjs/common';
import { RoleScope } from '@prisma/client';
import { AccessTokenGuard } from '../../shared/guards/access-token.guard';
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
  @Roles('SUPER_ADMIN')
  findAllPermissions(@Query('scope') scope?: RoleScope) {
    return this.permissionsService.findAllPermissions(scope);
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
  @Roles('SUPER_ADMIN')
  findPermissionById(@Param('id') id: string) {
    return this.permissionsService.findPermissionById(id);
  }

  @Patch(':id')
  @Roles('SUPER_ADMIN')
  updatePermission(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updatePermissionSchema))
    updatePermissionDto: UpdatePermissionDto,
  ) {
    return this.permissionsService.updatePermission(id, updatePermissionDto);
  }

  @Delete(':id')
  @Roles('SUPER_ADMIN')
  removePermission(@Param('id') id: string) {
    return this.permissionsService.removePermission(id);
  }
}
