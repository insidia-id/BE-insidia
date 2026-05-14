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

import { UserService } from './user.service';

import { createUserSchema, type CreateUserDto } from './dto/create-user.dto';

import { updateUserSchema, type UpdateUserDto } from './dto/update-user.dto';

import { ZodValidationPipe } from '../../shared/zod/zod-validation.pipe';

import { RolesGuard } from '../../shared/guards/admin-access.guard';

import {
  AccessTokenGuard,
  type AuthenticatedRequest,
} from '../../shared/guards/access-token.guard';

@UseGuards(AccessTokenGuard, RolesGuard)
@Controller('admin/user')
export class UserController {
  constructor(private readonly userService: UserService) {}

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
    @Query('scope') scope?: 'PLATFORM' | 'MITRA',
    @Query('filter') filter?: 'all' | 'available' | 'deleted',
  ) {
    return this.userService.findAll({
      scope: scope ?? 'PLATFORM',
      filter,
      auth: request.auth,
    });
  }
  @Get(':id')
  findOne(
    @Req() request: AuthenticatedRequest,
    @Param('id') id: string,
    @Query('scope') scope?: 'PLATFORM' | 'MITRA',
  ) {
    return this.userService.findOne(id, request.auth, scope ?? 'PLATFORM');
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
    @Query('scope') scope?: 'PLATFORM' | 'MITRA',
  ) {
    return this.userService.remove(id, request.auth, scope ?? 'PLATFORM');
  }
}
