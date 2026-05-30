import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, RoleScope } from '@prisma/client';
import { randomUUID } from 'crypto';
import { mkdir, unlink, writeFile } from 'fs/promises';
import { basename, dirname, extname, join, resolve } from 'path';
import { RolesPermissionService } from '../../roles/roles.permission';
import { CurriculumRepository } from '../curriculum/curriculum.repository';
import type { UploadedMaterialFile } from '../learning-material/material.types';
import {
  MitraAcademicPolicy,
  type MitraActorContext,
} from '../mitra-academic.policy';
import { MitraAcademicRepository } from '../mitra-academic.repository';
import { normalizeSlugPart } from './academic-shared.dto';
import type { MitraAcademicTerm } from './mitra-academic-query.helper';

@Injectable()
export class MitraAcademicAccessService {
  constructor(
    private readonly repository: MitraAcademicRepository,
    private readonly curriculumRepository: CurriculumRepository,
    private readonly policy: MitraAcademicPolicy,
    private readonly rolesPermissionService: RolesPermissionService,
  ) {}

  async ensureActor(userId: string, mitraId: string, permissionCode?: string) {
    const actor = permissionCode
      ? await this.rolesPermissionService.hasPermission(userId, {
          permission: permissionCode,
          scope: 'MITRA',
          requireMitraContext: true,
          mitraId,
        })
      : await this.repository.findActorContext(userId, mitraId);

    if (!actor) {
      throw new NotFoundException('User tidak ditemukan');
    }

    const context = this.mapActorContext(userId, actor);

    this.policy.canAccessMitra(context);
    await this.ensureMitraExists(mitraId);

    return context;
  }

  async ensureMitraAccess(
    userId: string,
    mitraId: string,
    permissionCode?: string,
  ) {
    return this.ensureActor(userId, mitraId, permissionCode);
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

  assertCanUseTeacherFeatures(actor: MitraActorContext) {
    this.policy.canUseTeacherFeatures(actor);
  }

  assertCanUseStudentFeatures(actor: MitraActorContext) {
    this.policy.canUseStudentFeatures(actor);
  }

  assertCanViewMaterials(actor: MitraActorContext) {
    this.policy.canViewMaterials(actor);
  }

  async ensureMitraExists(mitraId: string) {
    const mitra = await this.repository.findMitraById(mitraId);

    if (!mitra || mitra.deletedAt) {
      throw new NotFoundException('Mitra tidak ditemukan');
    }

    return mitra;
  }

  async ensureAcademicYear(id: string, mitraId: string) {
    const item = await this.repository.findAcademicYearById(id);

    if (!item || item.deletedAt || item.mitraId !== mitraId) {
      throw new NotFoundException('Tahun ajaran tidak ditemukan');
    }

    return item;
  }

  async ensureSemester(id: string, mitraId: string) {
    const item = await this.repository.findSemesterById(id);

    if (!item || item.deletedAt || item.mitraId !== mitraId) {
      throw new NotFoundException('Semester tidak ditemukan');
    }

    return item;
  }

  async ensureCurriculum(id: string, mitraId: string) {
    const item = await this.curriculumRepository.findCurriculumById(id);

    if (!item || item.deletedAt || item.mitraId !== mitraId) {
      throw new NotFoundException('Kurikulum tidak ditemukan');
    }

    return item;
  }

  async ensureSubject(id: string, mitraId: string) {
    const item = await this.repository.findSubjectById(id);

    if (
      !item ||
      item.deletedAt ||
      item.mitraId !== mitraId ||
      item.scope !== RoleScope.MITRA
    ) {
      throw new NotFoundException('Mata pelajaran tidak ditemukan');
    }

    return item;
  }

  async ensureAcademicClass(id: string, mitraId: string) {
    const item = await this.repository.findAcademicClassById(id);

    if (!item || item.deletedAt || item.mitraId !== mitraId) {
      throw new NotFoundException('Kelas tidak ditemukan');
    }

    return item;
  }

  async ensureClassGroup(id: string, mitraId: string) {
    const item = await this.repository.findClassGroupById(id);

    if (!item || item.deletedAt || item.mitraId !== mitraId) {
      throw new NotFoundException('Rombel tidak ditemukan');
    }

    return item;
  }

  async ensureClassGroupCourse(id: string, mitraId: string) {
    const item = await this.repository.findClassGroupCourseById(id);

    if (!item || item.deletedAt || item.mitraId !== mitraId) {
      throw new NotFoundException('Relasi rombel mapel tidak ditemukan');
    }

    return item;
  }

  async ensureClassGroupStudent(id: string, mitraId: string) {
    const item = await this.repository.findClassGroupStudentById(id);

    if (!item || item.deletedAt || item.mitraId !== mitraId) {
      throw new NotFoundException('Relasi rombel murid tidak ditemukan');
    }

    return item;
  }

  async ensureLearningMaterial(id: string, mitraId: string) {
    const item = await this.repository.findLearningMaterialById(id);

    if (!item || item.deletedAt || item.mitraId !== mitraId) {
      throw new NotFoundException('Materi tidak ditemukan');
    }

    return item;
  }

  async ensureMitraRoleMember(
    userId: string,
    mitraId: string,
    roleCode: 'GURU' | 'MURID',
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

  async validateClassRelations(
    mitraId: string,
    params: {
      academicYearId: string;
      semesterId: string;
      curriculumId: string;
    },
  ) {
    const [academicYear, semester] = await Promise.all([
      this.ensureAcademicYear(params.academicYearId, mitraId),
      this.ensureSemester(params.semesterId, mitraId),
      this.ensureCurriculum(params.curriculumId, mitraId),
    ]);

    if (semester.academicYearId !== academicYear.id) {
      throw new ConflictException(
        'Semester harus berada dalam tahun ajaran yang sama',
      );
    }
  }

  async generateSubjectSlug(
    mitraSlug: string,
    code: string,
    name: string,
    ignoredId?: string,
  ) {
    const base = [mitraSlug, code, name]
      .filter(Boolean)
      .map(normalizeSlugPart)
      .filter(Boolean)
      .join('-');

    let candidate = base || `${mitraSlug}-${randomUUID().slice(0, 8)}`;
    let counter = 1;

    while (true) {
      const existing = await this.repository.findSubjectBySlug(candidate);

      if (!existing || existing.id === ignoredId) {
        return candidate;
      }

      counter += 1;
      candidate = `${base}-${counter}`;
    }
  }

  async resolveDefaultTerm(mitraId: string, query: MitraAcademicTerm) {
    if (query.academicYearId && query.semesterId) {
      const [academicYear, semester] = await Promise.all([
        this.ensureAcademicYear(query.academicYearId, mitraId),
        this.ensureSemester(query.semesterId, mitraId),
      ]);

      if (semester.academicYearId !== academicYear.id) {
        throw new ConflictException(
          'semester harus berada dalam tahun ajaran yang sama',
        );
      }

      return query;
    }

    if (query.academicYearId && !query.semesterId) {
      await this.ensureAcademicYear(query.academicYearId, mitraId);
      const semester = await this.repository.findActiveSemester(
        mitraId,
        query.academicYearId,
      );

      if (!semester) {
        throw new NotFoundException(
          'Semester aktif belum dikonfigurasi untuk tahun ajaran ini',
        );
      }

      return {
        academicYearId: query.academicYearId,
        semesterId: semester.id,
      };
    }

    if (!query.academicYearId && query.semesterId) {
      const semester = await this.ensureSemester(query.semesterId, mitraId);

      return {
        academicYearId: semester.academicYearId,
        semesterId: semester.id,
      };
    }

    const academicYear = await this.repository.findActiveAcademicYear(mitraId);
    const semester = academicYear
      ? await this.repository.findActiveSemester(mitraId, academicYear.id)
      : null;

    if (!academicYear || !semester) {
      throw new NotFoundException(
        'Tahun ajaran aktif dan semester aktif belum dikonfigurasi',
      );
    }

    return {
      academicYearId: academicYear.id,
      semesterId: semester.id,
    };
  }

  assertPdfFile(file: UploadedMaterialFile | undefined) {
    if (!file) {
      throw new BadRequestException('File materi wajib dikirim');
    }

    const extension = extname(file.originalname).toLowerCase();
    const isPdf = file.mimetype === 'application/pdf' || extension === '.pdf';

    if (!isPdf) {
      throw new BadRequestException('File materi yang diizinkan minimal PDF');
    }

    return file;
  }

  async storeMaterialFile(mitraId: string, file: UploadedMaterialFile) {
    const extension = extname(file.originalname) || '.pdf';
    const safeName = normalizeSlugPart(basename(file.originalname, extension));
    const filename = `${Date.now()}-${randomUUID()}-${safeName}${extension}`;
    const relativePath = join('storage', 'materi', mitraId, filename);
    const absolutePath = this.resolveStoragePath(relativePath);

    await mkdir(dirname(absolutePath), { recursive: true });
    await writeFile(absolutePath, file.buffer);

    return {
      relativePath,
      absolutePath,
    };
  }

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

  private mapActorContext(
    userId: string,
    actor: {
      insidiaRole?: {
        role?: {
          code?: string | null;
        } | null;
      } | null;
      mitraRoles?: {
        role: {
          code: string;
        };
      } | null;
    },
  ): MitraActorContext {
    return {
      userId,
      isSuperAdmin: actor.insidiaRole?.role?.code === 'SUPER_ADMIN',
      mitraRoleCode: actor.mitraRoles?.role.code ?? null,
    };
  }
}
