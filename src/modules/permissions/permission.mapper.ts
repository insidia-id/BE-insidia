import {
  CreateModulePermissionDto,
  CreatePermissionDto,
} from './dto/create-permission.dto';
import { Prisma } from '@prisma/client';
import {
  UpdateModulePermissionDto,
  UpdatePermissionDto,
} from './dto/update-permission.dto';

export function mapCreateModulePermissionData(
  dto: CreateModulePermissionDto,
): Prisma.ModulePermissionCreateInput {
  const data = {} as Prisma.ModulePermissionCreateInput;
  assignModulePermission(data, dto);
  return data;
}

export function mapCreatePermissionData(
  dto: CreatePermissionDto,
): Prisma.PermissionCreateInput {
  const data = {} as Prisma.PermissionCreateInput;
  assignPermission(data, dto);
  return data;
}

export function mapUpdateModulePermissionData(
  dto: UpdateModulePermissionDto,
): Prisma.ModulePermissionUpdateInput {
  const data = {} as Prisma.ModulePermissionUpdateInput;
  assignUpdateModulePermission(data, dto);
  return data;
}

export function mapUpdatePermissionData(
  dto: UpdatePermissionDto,
): Prisma.PermissionUpdateInput {
  const data = {} as Prisma.PermissionUpdateInput;
  assignUpdatePermission(data, dto);
  return data;
}

function assignModulePermission(
  data: Prisma.ModulePermissionCreateInput,
  dto: CreateModulePermissionDto,
) {
  data.module = dto.module.trim();
  data.description = dto.description ?? null;
}

function assignUpdateModulePermission(
  data: Prisma.ModulePermissionUpdateInput,
  dto: UpdateModulePermissionDto,
) {
  if (dto.module !== undefined) data.module = dto.module.trim();
  if (dto.description !== undefined) data.description = dto.description;
}

function assignPermission(
  data: Prisma.PermissionCreateInput,
  dto: CreatePermissionDto,
) {
  data.name = dto.name.trim();
  data.code = dto.code.trim();
  data.scope = dto.scope;
  data.description = dto.description ?? null;
  data.module = { connect: { id: dto.moduleId } };
}
function assignUpdatePermission(
  data: Prisma.PermissionUpdateInput,
  dto: UpdatePermissionDto,
) {
  if (dto.name !== undefined) data.name = dto.name.trim();
  if (dto.code !== undefined) data.code = dto.code.trim();
  if (dto.scope !== undefined) data.scope = dto.scope;
  if (dto.description !== undefined) data.description = dto.description;
  if (dto.moduleId !== undefined)
    data.module = { connect: { id: dto.moduleId } };
}
