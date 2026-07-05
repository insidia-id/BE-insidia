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
import { ZodValidationPipe } from '../../shared/zod/zod-validation.pipe';
import {
  createCourseSchema,
  type CreateCourseDto,
} from './dto/create-course.dto';
import {
  updateCourseSchema,
  type UpdateCourseDto,
} from './dto/update-course.dto';
import { CourseService } from './course.service';

@UseGuards(AccessTokenGuard)
@Controller('admin/courses')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Post()
  create(
    @Body(new ZodValidationPipe(createCourseSchema))
    createCourseDto: CreateCourseDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.courseService.create(createCourseDto, request);
  }

  @Get()
  findAll(
    @Req() request: AuthenticatedRequest,
    @Query('scope') scope: RoleScope,
  ) {
    return this.courseService.findAll(request, scope);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Req() request: AuthenticatedRequest,
    @Query('scope') scope: RoleScope,
  ) {
    return this.courseService.findOne(id, request, scope);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateCourseSchema))
    updateCourseDto: UpdateCourseDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.courseService.update(id, updateCourseDto, request);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @Req() request: AuthenticatedRequest,
    @Query('scope') scope: RoleScope,
  ) {
    return this.courseService.remove(id, request, scope);
  }
}
