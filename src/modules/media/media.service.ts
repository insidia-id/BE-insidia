import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { AuthPayload } from '../auth/auth.types';
import { R2Service } from '../../infrastruktur/r2/r2.service';
import { CourseModulesService } from '../course-modules/course-modules.service';
import { CourseService } from '../course/course.service';
import type { UpdateMediaDto } from './dto/update-media.dto';
import type { UploadMediaDto } from './dto/upload-media.dto';
import {
  assertMediaFile,
  buildCourseMediaObjectKey,
  getCourseIdFromMedia,
  getCourseIdFromModule,
  mapCreateCourseMediaData,
  mapCreateModuleMediaData,
  mapUpdateMediaData,
  serializeMedia,
} from './media.mapper';
import { MediaPolicy } from './media.policy';
import { MediaRepository } from './media.repository';
import type { UploadedMediaFile } from './media.types';

export class MediaService {
  constructor(
    private readonly mediaRepository: MediaRepository,
    private readonly mediaPolicy: MediaPolicy,
    private readonly courseService: CourseService,
    private readonly courseModulesService: CourseModulesService,
    private readonly r2Service: R2Service,
  ) {}

  async uploadCourseMedia(
    courseId: string,
    uploadMediaDto: UploadMediaDto,
    fileInput: UploadedMediaFile | undefined,
    auth: AuthPayload,
  ) {
    const file = assertMediaFile(fileInput);
    const { actor, course } = await this.courseService.ensureCourseAccess(
      courseId,
      auth,
    );
    this.mediaPolicy.canManage(actor, { course, module: null }, auth);

    const objectKey = buildCourseMediaObjectKey(courseId, file.originalname);
    const uploaded = await this.r2Service.uploadObject({
      key: objectKey,
      body: file.buffer,
      contentType: file.mimetype,
    });

    try {
      const media = await this.mediaRepository.create(
        mapCreateCourseMediaData({
          courseId,
          upload: uploadMediaDto,
          file,
          objectKey: uploaded.key,
          url: uploaded.url,
        }),
      );

      return serializeMedia(media);
    } catch (error) {
      await this.cleanupUploadedObject(uploaded.key);
      this.handlePrismaError(error);
    }
  }

  async uploadModuleMedia(
    moduleId: string,
    uploadMediaDto: UploadMediaDto,
    fileInput: UploadedMediaFile | undefined,
    auth: AuthPayload,
  ) {
    const file = assertMediaFile(fileInput);
    const module = await this.courseModulesService.ensureModuleExists(moduleId);

    // const courseId = getCourseIdFromModule(module);

    // const { actor } = await this.courseService.ensureCourseAccess(
    //   courseId,
    //   auth,
    // );
    // this.mediaPolicy.canManage(actor, { course: null, module }, auth);

    const objectKey = buildCourseMediaObjectKey(
      'some-course-id', // Placeholder for courseId, replace with actual courseId if available
      file.originalname,
      module.id,
    );
    const uploaded = await this.r2Service.uploadObject({
      key: objectKey,
      body: file.buffer,
      contentType: file.mimetype,
    });

    try {
      const media = await this.mediaRepository.create(
        mapCreateModuleMediaData({
          courseId: 'some-course-id', // Placeholder for courseId, replace with actual courseId if available
          moduleId: module.id,
          upload: uploadMediaDto,
          file,
          objectKey: uploaded.key,
          url: uploaded.url,
        }),
      );

      return serializeMedia(media);
    } catch (error) {
      await this.cleanupUploadedObject(uploaded.key);
      this.handlePrismaError(error);
    }
  }

  async findCourseMedia(courseId: string, auth: AuthPayload) {
    await this.courseService.ensureCourseAccess(courseId, auth);

    const media = await this.mediaRepository.findCourseMedia(courseId);

    return media.map((item) => serializeMedia(item));
  }

  async findModuleMedia(moduleId: string, auth: AuthPayload) {
    const module = await this.courseModulesService.ensureModuleExists(moduleId);

    // Get courseId through domain relations
    // const courseId = getCourseIdFromModule(module);

    // await this.courseService.ensureCourseAccess(courseId, auth);

    const media = await this.mediaRepository.findModuleMedia(moduleId);

    return media.map((item) => serializeMedia(item));
  }

  async findOne(id: string, auth: AuthPayload) {
    const media = await this.ensureMediaExists(id);

    // Get courseId through domain-aware helper
    const courseId = getCourseIdFromMedia(media);

    const { actor } = await this.courseService.ensureCourseAccess(
      courseId,
      auth,
    );
    this.mediaPolicy.canManage(actor, media, auth);

    return serializeMedia(media);
  }

  async update(id: string, updateMediaDto: UpdateMediaDto, auth: AuthPayload) {
    const media = await this.ensureMediaExists(id);

    // Get courseId through domain-aware helper
    const courseId = getCourseIdFromMedia(media);

    const { actor } = await this.courseService.ensureCourseAccess(
      courseId,
      auth,
    );
    this.mediaPolicy.canManage(actor, media, auth);

    try {
      const updatedMedia = await this.mediaRepository.update(
        id,
        mapUpdateMediaData(updateMediaDto),
      );

      return serializeMedia(updatedMedia);
    } catch (error) {
      if (error instanceof Error && error.message === 'MEDIA_NOT_FOUND') {
        throw new NotFoundException('Media tidak ditemukan');
      }

      this.handlePrismaError(error);
    }
  }

  async remove(id: string, auth: AuthPayload) {
    const media = await this.ensureMediaExists(id);

    // Get courseId through domain-aware helper
    const courseId = getCourseIdFromMedia(media);

    const { actor } = await this.courseService.ensureCourseAccess(
      courseId,
      auth,
    );
    this.mediaPolicy.canManage(actor, media, auth);

    if (media.publicId) {
      await this.r2Service.deleteObject(media.publicId);
    }

    const deleted = await this.mediaRepository.remove(id);

    if (!deleted) {
      throw new NotFoundException('Media tidak ditemukan');
    }

    return { message: 'Media berhasil dihapus' };
  }

  private async ensureMediaExists(id: string) {
    const media = await this.mediaRepository.findById(id);

    if (!media) {
      throw new NotFoundException('Media tidak ditemukan');
    }

    return media;
  }

  private async cleanupUploadedObject(key: string) {
    try {
      await this.r2Service.deleteObject(key);
    } catch {
      return;
    }
  }

  private handlePrismaError(error: unknown): never {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new ConflictException('Urutan media sudah digunakan');
    }

    throw error;
  }
}
