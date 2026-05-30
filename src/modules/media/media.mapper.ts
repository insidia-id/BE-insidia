import { randomUUID } from 'crypto';
import { BadRequestException } from '@nestjs/common';
import { MediaOwnerType, MediaType, Prisma } from '@prisma/client';
import type { UploadMediaDto } from './dto/upload-media.dto';
import type { UpdateMediaDto } from './dto/update-media.dto';
import { mediaSelect } from './media.constants';
import type { UploadedMediaFile } from './media.types';

type MediaRecord = Prisma.MediaGetPayload<{
  select: typeof mediaSelect;
}>;

export function inferMediaType(
  mimeType: string | undefined,
  requestedType?: MediaType,
) {
  if (requestedType) {
    return requestedType;
  }

  if (!mimeType) {
    return MediaType.DOCUMENT;
  }

  if (mimeType.startsWith('image/')) {
    return MediaType.IMAGE;
  }

  if (mimeType.startsWith('video/')) {
    return MediaType.VIDEO;
  }

  if (mimeType.startsWith('audio/')) {
    return MediaType.AUDIO;
  }

  return MediaType.DOCUMENT;
}

function sanitizeFilename(filename: string) {
  return filename
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9.\-_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function buildCourseMediaObjectKey(
  courseId: string,
  filename: string,
  moduleId?: string,
) {
  const safeFilename = sanitizeFilename(filename);
  const uniqueId = randomUUID();

  if (moduleId) {
    return `courses/${courseId}/modules/${moduleId}/media/${uniqueId}-${safeFilename}`;
  }

  return `courses/${courseId}/media/${uniqueId}-${safeFilename}`;
}

export function assertMediaFile(
  file: UploadedMediaFile | undefined,
): UploadedMediaFile {
  if (!file) {
    throw new BadRequestException('File media wajib dikirim');
  }

  return file;
}

export function mapCreateCourseMediaData(params: {
  courseId: string;
  upload: UploadMediaDto;
  file: UploadedMediaFile;
  objectKey: string;
  url: string;
}) {
  const { courseId, upload, file, objectKey, url } = params;

  return {
    courseId,
    type: inferMediaType(file.mimetype, upload.type),
    ownerType: MediaOwnerType.COURSE,
    url,
    publicId: objectKey,
    filename: file.originalname,
    mimeType: file.mimetype,
    sizeBytes: file.size,
    alt: upload.alt ?? null,
    caption: upload.caption ?? null,
    sortOrder: upload.sortOrder,
    isPrimary: upload.isPrimary,
  } satisfies Prisma.MediaUncheckedCreateInput;
}

export function mapCreateModuleMediaData(params: {
  courseId: string;
  moduleId: string;
  upload: UploadMediaDto;
  file: UploadedMediaFile;
  objectKey: string;
  url: string;
}) {
  const { courseId, moduleId, upload, file, objectKey, url } = params;

  return {
    courseId,
    moduleId,
    type: inferMediaType(file.mimetype, upload.type),
    ownerType: MediaOwnerType.MODULE,
    url,
    publicId: objectKey,
    filename: file.originalname,
    mimeType: file.mimetype,
    sizeBytes: file.size,
    alt: upload.alt ?? null,
    caption: upload.caption ?? null,
    sortOrder: upload.sortOrder,
    isPrimary: upload.isPrimary,
  } satisfies Prisma.MediaUncheckedCreateInput;
}

export function mapUpdateMediaData(
  input: UpdateMediaDto,
): Prisma.MediaUpdateInput {
  return {
    ...(input.alt !== undefined ? { alt: input.alt } : {}),
    ...(input.caption !== undefined ? { caption: input.caption } : {}),
    ...(input.sortOrder !== undefined ? { sortOrder: input.sortOrder } : {}),
    ...(input.isPrimary !== undefined ? { isPrimary: input.isPrimary } : {}),
  };
}

export function serializeMedia(media: MediaRecord) {
  return {
    ...media,
    course:
      media.course === null
        ? null
        : {
            id: media.course.id,
            title: media.course.title,
            creatorId: media.course.creatorId,
          },
    module:
      media.module === null
        ? null
        : {
            id: media.module.id,
            title: media.module.title,
            course: {
              id: media.module.course.id,
              title: media.module.course.title,
              creatorId: media.module.course.creatorId,
            },
          },
  };
}
