import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { unlink } from 'fs/promises';
import { resolve } from 'path';
import { RolesPermissionService } from '../../roles/roles.permission';
import {
  MitraAcademicPolicy,
  type MitraActorContext,
} from '../mitra-academic.policy';
import { MitraAcademicRepository } from '../mitra-academic.repository';
import type { MitraRole } from '../../../shared/types/types';
import { MitraService } from '../../mitra/mitra.service';
@Injectable()
export class MitraAcademicAccessService {
  constructor(
    private readonly repository: MitraAcademicRepository,
    private readonly policy: MitraAcademicPolicy,
    private readonly rolesPermissionService: RolesPermissionService,
    private readonly mitraService: MitraService,
  ) {}

  async ensureActor(
    userId: string,
    activeMitraId: string,
    permissionCode?: string,
  ) {
    const actor = permissionCode
      ? await this.rolesPermissionService.hasPermission(userId, {
          permission: permissionCode,
          scope: 'MITRA',
          requireMitraContext: true,
          mitraId: activeMitraId,
        })
      : await this.repository.findActorContext(userId, activeMitraId);

    if (!actor) {
      throw new NotFoundException('User tidak ditemukan');
    }

    const context = this.mapActorContext(userId, actor);

    await this.mitraService.ensureMitraExists(activeMitraId);

    return context;
  }

  async ensureMitraAccess(
    actor: MitraActorContext,
    mitraId: string,
    activeMitraId: string,
  ) {
    this.policy.canAccessMitra(actor, mitraId, activeMitraId);
  }

  async ensureAcademicManager(
    userId: string,
    mitraId: string,
    permissionCode?: string,
  ) {
    const actor = await this.ensureActor(userId, mitraId, permissionCode);
    this.policy.canManageAcademic(actor);
    return actor;
  }

  async ensureTeacherAccess(
    userId: string,
    mitraId: string,
    permissionCode?: string,
  ) {
    const actor = await this.ensureActor(userId, mitraId, permissionCode);
    this.assertCanUseTeacherFeatures(actor);
    return actor;
  }

  async ensureStudentAccess(
    userId: string,
    mitraId: string,
    permissionCode?: string,
  ) {
    const actor = await this.ensureActor(userId, mitraId, permissionCode);
    this.assertCanUseStudentFeatures(actor);
    return actor;
  }

  async ensureMaterialViewerAccess(
    userId: string,
    mitraId: string,
    permissionCode?: string,
  ) {
    const actor = await this.ensureActor(userId, mitraId, permissionCode);
    this.assertCanViewMaterials(actor);
    return actor;
  }

  assertCanUseAcademicFeatures(actor: MitraActorContext) {
    this.policy.canManageAcademic(actor);
  }

  assertCanUseTeacherFeatures(actor: MitraActorContext) {
    this.policy.canUseTeacherFeatures(actor);
  }

  assertCanUseStudentFeatures(actor: MitraActorContext) {
    this.policy.canUseStudentFeatures(actor);
  }

  assertCanViewMaterials(actor: MitraActorContext) {
    this.policy.canViewMaterials(actor);
  }

  async ensureMitraRoleMember(
    userId: string,
    mitraId: string,
    roleCode: MitraRole,
  ) {
    const membership = await this.repository.findUserMitraRoleByCode(
      userId,
      mitraId,
      roleCode,
    );

    if (!membership) {
      throw new ConflictException(
        `User belum terdaftar sebagai ${roleCode.toLowerCase()} pada mitra ini`,
      );
    }

    return membership;
  }

  private readonly MAX_SLUG_ATTEMPTS = 100;

  resolveStoragePath(relativePath: string) {
    return resolve(process.cwd(), relativePath);
  }

  async deleteStoredFile(absolutePath: string) {
    try {
      await unlink(absolutePath);
    } catch {
      return;
    }
  }

  handlePrismaError(error: unknown): never {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new ConflictException('Data akademik sudah digunakan');
    }

    throw error;
  }

  mapActorContext(
    userId: string,
    actor: {
      insidiaRole?: {
        role?: {
          code?: string | null;
        } | null;
      } | null;
      mitraRoles?:
        | {
            role: {
              code: string;
            };
          }[]
        | null;
    },
  ): MitraActorContext {
    return {
      userId,
      isSuperAdmin: actor.insidiaRole?.role?.code === 'SUPER_ADMIN',
      mitraRoleCode: actor.mitraRoles?.map((r) => r.role.code) || null,
    };
  }
}
