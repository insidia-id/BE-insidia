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

  /**
   * Create module for INSIDIA domain
   */
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
      request.auth,
    );
  }

  /**
   * Create module for MITRA domain
   */
  @Post('class-group-courses/:classGroupCourseId/modules')
  createForMitra(
    @Param('classGroupCourseId') classGroupCourseId: string,
    @Body(new ZodValidationPipe(createCourseModuleSchema))
    createCourseModuleDto: CreateCourseModuleDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.courseModulesService.createForMitra(
      classGroupCourseId,
      createCourseModuleDto,
      request.auth,
    );
  }

  /**
   * Get modules for INSIDIA domain
   */
  @Get('courses-insidia/:courseInsidiaId/modules')
  findByCourseInsidiaId(
    @Param('courseInsidiaId') courseInsidiaId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.courseModulesService.findByCourseInsidiaId(
      courseInsidiaId,
      request.auth,
    );
  }

  /**
   * Get modules for MITRA domain
   */
  @Get('class-group-courses/:classGroupCourseId/modules')
  findByClassGroupCourseId(
    @Param('classGroupCourseId') classGroupCourseId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.courseModulesService.findByClassGroupCourseId(
      classGroupCourseId,
      request.auth,
    );
  }

  /**
   * Get single module by ID (works for both domains)
   */
  @Get('modules/:id')
  findOne(@Param('id') id: string, @Req() request: AuthenticatedRequest) {
    return this.courseModulesService.findOne(id, request.auth);
  }

  /**
   * Update module (works for both domains)
   */
  @Patch('modules/:id')
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

  /**
   * Delete module (works for both domains)
   */
  @Delete('modules/:id')
  remove(@Param('id') id: string, @Req() request: AuthenticatedRequest) {
    return this.courseModulesService.remove(id, request.auth);
  }
}
