import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
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
  assignRolePermissionsSchema,
  type AssignRolePermissionsDto,
} from './dto/assign-role-permissions.dto';
import { createRoleSchema, type CreateRoleDto } from './dto/create-role.dto';
import { updateRoleSchema, type UpdateRoleDto } from './dto/update-role.dto';
import { RolesService } from './roles.service';

@UseGuards(AccessTokenGuard, RolesGuard)
@Controller('admin/roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @Roles('SUPER_ADMIN')
  createRole(
    @Req() request: AuthenticatedRequest,
    @Body(new ZodValidationPipe(createRoleSchema))
    createRoleDto: CreateRoleDto,
  ) {
    return this.rolesService.createRole(request.auth, createRoleDto);
  }

  @Get()
  findAllRoles(
    @Req() request: AuthenticatedRequest,
    @Query('scope') scope: RoleScope,
    @Query('includeDeleted') includeDeleted?: string,
    @Query('mitraId') mitraId?: string,
  ) {
    return this.rolesService.findAllRoles(
      request.auth,
      scope,
      includeDeleted === 'true',
      mitraId,
    );
  }

  @Get(':roleId/permissions')
  @Roles('SUPER_ADMIN')
  findRolePermissions(@Param('roleId') roleId: string) {
    return this.rolesService.findRolePermissions(roleId);
  }

  @Post(':roleId/permissions')
  @Roles('SUPER_ADMIN')
  addRolePermissions(
    @Param('roleId') roleId: string,
    @Body(new ZodValidationPipe(assignRolePermissionsSchema))
    assignRolePermissionsDto: AssignRolePermissionsDto,
  ) {
    return this.rolesService.addRolePermissions(
      roleId,
      assignRolePermissionsDto,
    );
  }

  @Put(':roleId/permissions')
  @Roles('SUPER_ADMIN')
  replaceRolePermissions(
    @Req() request: AuthenticatedRequest,
    @Param('roleId') roleId: string,
    @Body(new ZodValidationPipe(assignRolePermissionsSchema))
    assignRolePermissionsDto: AssignRolePermissionsDto,
  ) {
    return this.rolesService.replaceRolePermissions(
      request.auth,
      roleId,
      assignRolePermissionsDto,
    );
  }

  @Put(':roleId/permissions/mitras/:mitraId')
  replaceMitraRolePermissions(
    @Req() request: AuthenticatedRequest,
    @Param('mitraId') mitraId: string,
    @Param('roleId') roleId: string,
    @Body(new ZodValidationPipe(assignRolePermissionsSchema))
    assignRolePermissionsDto: AssignRolePermissionsDto,
  ) {
    return this.rolesService.replaceMitraRolePermissions(
      request.auth,
      mitraId,
      roleId,
      assignRolePermissionsDto,
    );
  }

  @Delete(':roleId/permissions/:permissionId')
  @Roles('SUPER_ADMIN')
  removeRolePermission(
    @Param('roleId') roleId: string,
    @Param('permissionId') permissionId: string,
  ) {
    return this.rolesService.removeRolePermission(roleId, permissionId);
  }

  @Get(':id')
  @Roles('SUPER_ADMIN')
  findRoleById(@Param('id') id: string) {
    return this.rolesService.findRoleById(id);
  }

  @Patch(':id')
  @Roles('SUPER_ADMIN')
  updateRole(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateRoleSchema))
    updateRoleDto: UpdateRoleDto,
  ) {
    return this.rolesService.updateRole(id, updateRoleDto);
  }

  @Delete(':id')
  @Roles('SUPER_ADMIN')
  removeRole(@Param('id') id: string) {
    return this.rolesService.removeRole(id);
  }
}
