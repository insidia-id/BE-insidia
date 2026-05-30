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
import {
  AccessTokenGuard,
  type AuthenticatedRequest,
} from '../../../shared/guards/access-token.guard';
import { ZodValidationPipe } from '../../../shared/zod/zod-validation.pipe';
import {
  classGroupCourseListQuerySchema,
  createClassGroupCourseSchema,
  type ClassGroupCourseListQueryDto,
  type CreateClassGroupCourseDto,
  updateClassGroupCourseSchema,
  type UpdateClassGroupCourseDto,
} from './class-group-course.dto';
import { ClassGroupCourseService } from './class-group-course.service';

@UseGuards(AccessTokenGuard)
@Controller('mitras/:mitraId/academic/rombel-mapel')
export class ClassGroupCourseController {
  constructor(private readonly service: ClassGroupCourseService) {}

  @Post()
  createClassGroupCourse(
    @Param('mitraId') mitraId: string,
    @Body(new ZodValidationPipe(createClassGroupCourseSchema))
    dto: CreateClassGroupCourseDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.service.createClassGroupCourse(mitraId, dto, request.auth);
  }

  @Get()
  findClassGroupCourses(
    @Param('mitraId') mitraId: string,
    @Query(new ZodValidationPipe(classGroupCourseListQuerySchema))
    query: ClassGroupCourseListQueryDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.service.findClassGroupCourses(mitraId, request.auth, query);
  }

  @Get(':id')
  findClassGroupCourse(
    @Param('mitraId') mitraId: string,
    @Param('id') id: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.service.findClassGroupCourse(mitraId, id, request.auth);
  }

  @Patch(':id')
  updateClassGroupCourse(
    @Param('mitraId') mitraId: string,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateClassGroupCourseSchema))
    dto: UpdateClassGroupCourseDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.service.updateClassGroupCourse(mitraId, id, dto, request.auth);
  }

  @Delete(':id')
  removeClassGroupCourse(
    @Param('mitraId') mitraId: string,
    @Param('id') id: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.service.removeClassGroupCourse(mitraId, id, request.auth);
  }
}
