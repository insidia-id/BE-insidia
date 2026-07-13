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
import { requireActiveMitraId } from 'src/shared/session/active-mitra-session';
import { RoleScope } from '@prisma/client';
@UseGuards(AccessTokenGuard)
@Controller('admin')
export class CourseModulesController {
  constructor(private readonly courseModulesService: CourseModulesService) {}

  @Post('courses-insidia/:courseInsidiaId/modules')
  createForInsidia(
    @Param('courseInsidiaId') courseInsidiaId: string,
    @Body(new ZodValidationPipe(createCourseModuleSchema))
    createCourseModuleDto: CreateCourseModuleDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.courseModulesService.createForInsidia(
      courseInsidiaId,
      createCourseModuleDto,
      request,
    );
  }

  @Post('class-group-courses/:classGroupCourseId/modules')
  createForMitra(
    @Param('classGroupCourseId') classGroupCourseId: string,
    @Body(new ZodValidationPipe(createCourseModuleSchema))
    createCourseModuleDto: CreateCourseModuleDto,
    @Req() request: AuthenticatedRequest,
  ) {
    const activeMitraId = requireActiveMitraId(
      request,
      createCourseModuleDto.mitraId,
    );
    return this.courseModulesService.createForMitra(
      classGroupCourseId,
      createCourseModuleDto,
      request,
      activeMitraId,
    );
  }

  @Get('courses-insidia/:courseInsidiaId/modules')
  findByCourseInsidiaId(@Param('courseInsidiaId') courseInsidiaId: string) {
    return this.courseModulesService.findByCourseInsidiaId(courseInsidiaId);
  }

  @Get('class-group-courses/:classGroupCourseId/modules')
  findByClassGroupCourseId(
    @Param('classGroupCourseId') classGroupCourseId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.courseModulesService.findByClassGroupCourseId(
      classGroupCourseId,
      request,
    );
  }

  @Get('modules/:id')
  findOne(@Param('id') id: string, @Req() request: AuthenticatedRequest) {
    return this.courseModulesService.findOne(id, request);
  }

  @Patch('modules/:id')
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateCourseModuleSchema))
    updateCourseModuleDto: UpdateCourseModuleDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.courseModulesService.update(id, updateCourseModuleDto, request);
  }

  @Delete('modules/:id')
  remove(@Param('id') id: string, @Req() request: AuthenticatedRequest) {
    return this.courseModulesService.remove(id, request);
  }
}
