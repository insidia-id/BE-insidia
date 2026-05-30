import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  AccessTokenGuard,
  type AuthenticatedRequest,
} from '../../shared/guards/access-token.guard';
import { ZodValidationPipe } from '../../shared/zod/zod-validation.pipe';
import { updateMediaSchema, type UpdateMediaDto } from './dto/update-media.dto';
import { uploadMediaSchema, type UploadMediaDto } from './dto/upload-media.dto';
import { MediaService } from './media.service';
import type { UploadedMediaFile } from './media.types';

const mediaFileInterceptor = FileInterceptor('file', {
  limits: {
    fileSize: 50 * 1024 * 1024,
  },
});

@UseGuards(AccessTokenGuard)
@Controller('admin')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('courses/:courseId/media/upload')
  @UseInterceptors(mediaFileInterceptor)
  uploadCourseMedia(
    @Param('courseId') courseId: string,
    @Body(new ZodValidationPipe(uploadMediaSchema))
    uploadMediaDto: UploadMediaDto,
    @UploadedFile() file: UploadedMediaFile | undefined,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.mediaService.uploadCourseMedia(
      courseId,
      uploadMediaDto,
      file,
      request.auth,
    );
  }

  @Post('course-modules/:moduleId/media/upload')
  @UseInterceptors(mediaFileInterceptor)
  uploadModuleMedia(
    @Param('moduleId') moduleId: string,
    @Body(new ZodValidationPipe(uploadMediaSchema))
    uploadMediaDto: UploadMediaDto,
    @UploadedFile() file: UploadedMediaFile | undefined,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.mediaService.uploadModuleMedia(
      moduleId,
      uploadMediaDto,
      file,
      request.auth,
    );
  }

  @Get('courses/:courseId/media')
  findCourseMedia(
    @Param('courseId') courseId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.mediaService.findCourseMedia(courseId, request.auth);
  }

  @Get('course-modules/:moduleId/media')
  findModuleMedia(
    @Param('moduleId') moduleId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.mediaService.findModuleMedia(moduleId, request.auth);
  }

  @Get('media/:id')
  findOne(@Param('id') id: string, @Req() request: AuthenticatedRequest) {
    return this.mediaService.findOne(id, request.auth);
  }

  @Patch('media/:id')
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateMediaSchema))
    updateMediaDto: UpdateMediaDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.mediaService.update(id, updateMediaDto, request.auth);
  }

  @Delete('media/:id')
  remove(@Param('id') id: string, @Req() request: AuthenticatedRequest) {
    return this.mediaService.remove(id, request.auth);
  }
}
