import { ForbiddenException, Injectable } from '@nestjs/common';
import type { AuthPayload } from '../auth/auth.types';
import type { actorRole } from '../user/user.types';

type InsidiaTarget = {
  creatorId: string;
};

type MitraTarget = {
  teacherId: string;
};

@Injectable()
export class CourseModulesPolicy {
  /**
   * Check if user can manage modules in INSIDIA domain
   * Rules:
   * - SUPER_ADMIN and ADMIN can manage any course modules
   * - MENTOR can only manage their own course modules
   */
  canManageInsidia(actor: actorRole, target: InsidiaTarget, auth: AuthPayload) {
    const roleCode = actor.insidiaRole?.role.code;

    // SUPER_ADMIN and ADMIN can manage any course
    if (roleCode === 'SUPER_ADMIN' || roleCode === 'ADMIN') {
      return true;
    }

    // MENTOR can only manage their own courses
    if (roleCode === 'MENTOR' && auth.sub === target.creatorId) {
      return true;
    }

    throw new ForbiddenException(
      'Tidak memiliki akses untuk mengelola module course ini',
    );
  }

  /**
   * Check if user can manage modules in MITRA domain
   * Rules:
   * - Only the assigned teacher can manage their ClassGroupCourse modules
   * - AKADEMIK role users with proper access can also manage
   */
  canManageMitra(actor: actorRole, target: MitraTarget, auth: AuthPayload) {
    // Check if user is the assigned teacher
    if (auth.sub === target.teacherId) {
      return true;
    }

    // Check if user has AKADEMIK role in mitra
    const hasAkademikRole = actor.mitraRoles?.some(
      (r) => r.role.code === 'AKADEMIK',
    );

    if (hasAkademikRole) {
      return true;
    }

    throw new ForbiddenException(
      'Tidak memiliki akses untuk mengelola module ini',
    );
  }
}
