import { ForbiddenException, Injectable } from '@nestjs/common';
import type { AuthPayload } from '../auth/auth.types';
import type { actorRole } from '../user/user.types';
import { mediaSelect } from './media.constants';
import { Prisma } from '@prisma/client';

type MediaRecord = Prisma.MediaGetPayload<{
  select: typeof mediaSelect;
}>;

type ModuleRecord = NonNullable<MediaRecord['module']>;

type MediaTarget = {
  course: {
    creatorId: string;
  } | null;
  module: ModuleRecord | null;
};

@Injectable()
export class MediaPolicy {
  /**
   * Check if user can manage media based on domain
   */
  canManage(actor: actorRole, target: MediaTarget, auth?: AuthPayload) {
    // If media is attached to course directly
    if (target.course) {
      return this.canManageInsidiaCourse(actor, target.course.creatorId, auth);
    }

    // If media is attached to module, check through domain
    if (target.module) {
      return this.canManageModule(actor, target.module, auth);
    }

    throw new ForbiddenException('Media tidak terhubung ke entity yang valid');
  }

  private canManageInsidiaCourse(
    actor: actorRole,
    creatorId: string,
    auth?: AuthPayload,
  ) {
    const roleCode = actor.insidiaRole?.role.code;

    // SUPER_ADMIN and ADMIN can manage any course
    if (roleCode === 'SUPER_ADMIN' || roleCode === 'ADMIN') {
      return true;
    }

    // MENTOR can only manage their own courses
    if (roleCode === 'MENTOR' && auth?.sub === creatorId) {
      return true;
    }

    throw new ForbiddenException(
      'Tidak memiliki akses untuk mengelola media ini',
    );
  }

  private canManageModule(
    actor: actorRole,
    module: ModuleRecord,
    auth?: AuthPayload,
  ) {
    // Determine domain from module
    if (module.courseInsidiaId && module.courseInsidia) {
      // INSIDIA domain
      return this.canManageInsidiaCourse(
        actor,
        module.courseInsidia.course.creatorId,
        auth,
      );
    }

    if (module.classGroupCourseId && module.classGroupCourse) {
      // MITRA domain
      return this.canManageMitra(
        actor,
        module.classGroupCourse.teacherId,
        auth,
      );
    }

    throw new ForbiddenException('Module tidak memiliki domain yang valid');
  }

  private canManageMitra(
    actor: actorRole,
    teacherId: string,
    auth?: AuthPayload,
  ) {
    // Check if user is the assigned teacher
    if (auth?.sub === teacherId) {
      return true;
    }

    // Check if user has AKADEMIK role
    const hasAkademikRole = actor.mitraRoles?.some(
      (r) => r.role.code === 'AKADEMIK',
    );

    if (hasAkademikRole) {
      return true;
    }

    throw new ForbiddenException(
      'Tidak memiliki akses untuk mengelola media ini',
    );
  }
}
