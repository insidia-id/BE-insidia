import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, RoleScope } from '@prisma/client';
import type { CreateMitraMemberDto } from './dto/create-mitra-member.dto';
import type { CreateMitraDto } from './dto/create-mitra.dto';
import { normalizeMitraSlug } from './dto/create-mitra.dto';
import type { UpdateMitraDto } from './dto/update-mitra.dto';
import { MitraRepository } from './mitra.repository';
import { RolesPermissionService } from '../roles/roles.permission';
import { AuthPayload } from '../auth/auth.types';
import { mitraPermissionCode } from './mitra.constants';
import { MitraFilter } from './mitra.types';

@Injectable()
export class MitraService {
  constructor(
    private readonly mitraRepository: MitraRepository,
    private readonly rolePermissionService: RolesPermissionService,
  ) {}

  async create(auth: AuthPayload, createMitraDto: CreateMitraDto) {
    const slug = normalizeMitraSlug(createMitraDto.name);
    await this.ensureSlugAvailable(slug);
    await this.rolePermissionService.hasPermission(auth.sub, {
      permission: mitraPermissionCode.create,
      scope: 'MITRA',
    });
    try {
      return await this.mitraRepository.create({
        name: createMitraDto.name,
        slug,
        type: createMitraDto.type,
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async findAll(auth: AuthPayload, filter: MitraFilter, keyword?: string) {
    await this.rolePermissionService.hasPermission(auth.sub, {
      permission: mitraPermissionCode.view,
      scope: 'MITRA',
    });

    const normalizedKeyword = keyword?.trim();

    return this.mitraRepository.findAll({
      filter,
      keyword: normalizedKeyword ? normalizedKeyword : undefined,
    });
  }

  async findOne(auth: AuthPayload, mitraId: string) {
    const mitra = await this.mitraRepository.findById(mitraId);
    await this.rolePermissionService.hasPermission(auth.sub, {
      permission: mitraPermissionCode.view,
      scope: 'MITRA',
      mitraId,
    });
    if (!mitra || mitra.deletedAt) {
      throw new NotFoundException('Mitra tidak ditemukan');
    }

    return mitra;
  }

  async update(
    auth: AuthPayload,
    mitraId: string,
    updateMitraDto: UpdateMitraDto,
  ) {
    await this.findOne(auth, mitraId);
    await this.rolePermissionService.hasPermission(auth.sub, {
      permission: mitraPermissionCode.update,
      scope: 'MITRA',
      mitraId,
    });
    if (updateMitraDto.slug) {
      const existing = await this.mitraRepository.findBySlug(
        updateMitraDto.slug,
      );
      if (existing && existing.id !== mitraId && !existing.deletedAt) {
        throw new ConflictException('Slug mitra sudah digunakan');
      }
    }

    try {
      return await this.mitraRepository.update(mitraId, {
        ...(updateMitraDto.name !== undefined
          ? { name: updateMitraDto.name }
          : {}),
        ...(updateMitraDto.slug !== undefined
          ? { slug: updateMitraDto.slug }
          : {}),
        ...(updateMitraDto.type !== undefined
          ? { type: updateMitraDto.type }
          : {}),
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async remove(auth: AuthPayload, mitraId: string) {
    await this.findOne(auth, mitraId);
    await this.mitraRepository.softDelete(mitraId);
    return {
      message: 'Mitra berhasil dihapus',
    };
  }

  async findMembers(auth: AuthPayload, mitraId: string) {
    await this.findOne(auth, mitraId);
    return this.mitraRepository.findMembersByMitraId(mitraId);
  }

  async assignMember(
    auth: AuthPayload,
    mitraId: string,
    createMitraMemberDto: CreateMitraMemberDto,
  ) {
    await this.findOne(auth, mitraId);

    const [user, role] = await Promise.all([
      this.mitraRepository.findUserById(createMitraMemberDto.userId),
      this.mitraRepository.findRoleByCode(createMitraMemberDto.roleCode),
    ]);

    if (!user || user.deletedAt) {
      throw new NotFoundException('User tidak ditemukan');
    }

    if (!role || role.deletedAt) {
      throw new NotFoundException('Role tidak ditemukan');
    }

    if (role.scope !== RoleScope.MITRA) {
      throw new ConflictException('Role harus memiliki scope MITRA');
    }

    const existing = await this.mitraRepository.findMemberByComposite({
      userId: createMitraMemberDto.userId,
      mitraId,
      roleId: role.id,
    });

    if (existing) {
      throw new ConflictException(
        'User sudah memiliki role tersebut di mitra ini',
      );
    }

    try {
      return await this.mitraRepository.createMember({
        mitra: {
          connect: {
            id: mitraId,
          },
        },
        user: {
          connect: {
            id: createMitraMemberDto.userId,
          },
        },
        role: {
          connect: {
            id: role.id,
          },
        },
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async removeMember(auth: AuthPayload, mitraId: string, memberId: string) {
    await this.findOne(auth, mitraId);
    const member = await this.mitraRepository.findMemberById(memberId);

    if (!member || member.mitraId !== mitraId) {
      throw new NotFoundException('Member mitra tidak ditemukan');
    }

    await this.mitraRepository.removeMember(memberId);
    return {
      message: 'Member mitra berhasil dihapus',
    };
  }

  private async ensureSlugAvailable(slug: string) {
    const existing = await this.mitraRepository.findBySlug(slug);

    if (existing && !existing.deletedAt) {
      throw new ConflictException('Slug mitra sudah digunakan');
    }
  }

  private handlePrismaError(error: unknown): never {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new ConflictException('Data mitra sudah digunakan');
    }

    throw error;
  }
}
