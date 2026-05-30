import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  AccessTokenGuard,
  type AuthenticatedRequest,
} from '../../shared/guards/access-token.guard';
import { ZodValidationPipe } from '../../shared/zod/zod-validation.pipe';
import {
  createCourseModuleSchema,
  type CreateCourseModuleDto,
} from './dto/create-course-module.dto';
import {
  updateCourseModuleSchema,
  type UpdateCourseModuleDto,
} from './dto/update-course-module.dto';
import { CourseModulesService } from './course-modules.service';

@UseGuards(AccessTokenGuard)
@Controller('admin')
export class CourseModulesController {
  constructor(private readonly courseModulesService: CourseModulesService) {}

  @Post('courses/:courseId/modules')
  create(
    @Param('courseId') courseId: string,
    @Body(new ZodValidationPipe(createCourseModuleSchema))
    createCourseModuleDto: CreateCourseModuleDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.courseModulesService.create(
      courseId,
      createCourseModuleDto,
      request.auth,
    );
  }

  @Get('courses/:courseId/modules')
  findByCourseId(
    @Param('courseId') courseId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.courseModulesService.findByCourseId(courseId, request.auth);
  }

  @Get('course-modules/:id')
  findOne(@Param('id') id: string, @Req() request: AuthenticatedRequest) {
    return this.courseModulesService.findOne(id, request.auth);
  }

  @Patch('course-modules/:id')
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateCourseModuleSchema))
    updateCourseModuleDto: UpdateCourseModuleDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.courseModulesService.update(
      id,
      updateCourseModuleDto,
      request.auth,
    );
  }

  @Delete('course-modules/:id')
  remove(@Param('id') id: string, @Req() request: AuthenticatedRequest) {
    return this.courseModulesService.remove(id, request.auth);
  }
}
