import { ForbiddenException, Injectable } from '@nestjs/common';

export type MitraActorContext = {
  userId: string;
  isSuperAdmin: boolean;
  mitraRoleCode: string[] | null;
};

@Injectable()
export class MitraAcademicPolicy {
  canAccessMitra(actor: MitraActorContext) {
    if (actor.isSuperAdmin || actor.mitraRoleCode) {
      return true;
    }

    throw new ForbiddenException('Anda tidak memiliki akses ke mitra ini');
  }

  canManageAcademic(actor: MitraActorContext) {
    if (
      actor.isSuperAdmin ||
      actor.mitraRoleCode?.find((code) => code === 'AKADEMIK')
    ) {
      return true;
    }

    throw new ForbiddenException(
      'Anda tidak memiliki akses mengelola data akademik',
    );
  }

  canUseTeacherFeatures(actor: MitraActorContext) {
    if (
      actor.isSuperAdmin ||
      actor.mitraRoleCode?.find((code) => code === 'GURU')
    ) {
      return true;
    }

    throw new ForbiddenException('Fitur ini hanya untuk guru');
  }

  canUseStudentFeatures(actor: MitraActorContext) {
    if (
      actor.isSuperAdmin ||
      actor.mitraRoleCode?.find((code) => code === 'MURID')
    ) {
      return true;
    }

    throw new ForbiddenException('Fitur ini hanya untuk murid');
  }

  canViewMaterials(actor: MitraActorContext) {
    if (
      actor.isSuperAdmin ||
      actor.mitraRoleCode?.find((code) => code === 'AKADEMIK') ||
      actor.mitraRoleCode?.find((code) => code === 'GURU') ||
      actor.mitraRoleCode?.find((code) => code === 'MURID')
    ) {
      return true;
    }

    throw new ForbiddenException('Anda tidak memiliki akses melihat materi');
  }
}
