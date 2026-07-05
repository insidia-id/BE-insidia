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
} from '../../shared/guards/access-token.guard';
import { requireActiveMitraId } from '../../shared/session/active-mitra-session';
import { ZodValidationPipe } from '../../shared/zod/zod-validation.pipe';
import {
  classGroupCourseListQuerySchema,
  createClassGroupCourseSchema,
  type ClassGroupCourseListQueryDto,
  type CreateClassGroupCourseDto,
  updateClassGroupCourseSchema,
  type UpdateClassGroupCourseDto,
} from './dto/class-group-course.dto';
import { ClassGroupCourseService } from './class-group-course.service';

@UseGuards(AccessTokenGuard)
@Controller('mitras')
export class ClassGroupCourseController {
  constructor(private readonly service: ClassGroupCourseService) {}

  @Post('/:mitraId/class-group-courses')
  createClassGroupCourse(
    @Body(new ZodValidationPipe(createClassGroupCourseSchema))
    @Param('mitraId')
    mitraId: string,
    dto: CreateClassGroupCourseDto,
    @Req() request: AuthenticatedRequest,
  ) {
    const activeMitraId = requireActiveMitraId(request, mitraId);
    return this.service.createClassGroupCourse(activeMitraId, dto, request);
  }

  @Get('/:mitraId/class-group-courses')
  findClassGroupCourses(
    @Query(new ZodValidationPipe(classGroupCourseListQuerySchema))
    query: ClassGroupCourseListQueryDto,
    @Req() request: AuthenticatedRequest,
  ) {
    const mitraId = requireActiveMitraId(request);
    return this.service.findClassGroupCourses(mitraId, request, query);
  }

  @Get('/:mitraId/class-group-courses/:id')
  findClassGroupCourse(
    @Param('id') id: string,
    @Req() request: AuthenticatedRequest,
  ) {
    const mitraId = requireActiveMitraId(request);
    return this.service.findClassGroupCourse(mitraId, id, request);
  }

  @Patch('/:mitraId/class-group-courses/:id')
  updateClassGroupCourse(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateClassGroupCourseSchema))
    dto: UpdateClassGroupCourseDto,
    @Req() request: AuthenticatedRequest,
  ) {
    const mitraId = requireActiveMitraId(request);
    return this.service.updateClassGroupCourse(mitraId, id, dto, request);
  }

  @Delete('/:mitraId/class-group-courses/:id')
  removeClassGroupCourse(
    @Param('id') id: string,
    @Req() request: AuthenticatedRequest,
  ) {
    const mitraId = requireActiveMitraId(request);
    return this.service.removeClassGroupCourse(mitraId, id, request);
  }
}
