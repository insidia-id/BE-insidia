import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Prisma, UserStatus } from '@prisma/client';
import { getInsidiaRoleCode } from '../access-control/access-control.utils';
import type { AuthPayload } from '../auth/auth.types';
import type { CreateUserDto } from './dto/create-user.dto';
import type { UpdateUserDto } from './dto/update-user.dto';
import { adminRoleSet, UserFilter, userPermisionsCode } from './user.constants';
import { DuplicateUserFieldError } from './user.errors';
import {
  mapCreateUserData,
  mapUpdateUserData,
  normalizeEmail,
  serializeUserWithAccess,
} from './user.mapper';
import { UserPolicy } from './user.Policy';
import { UserRepository } from './user.repository';
import { RolesPermissionService } from '../roles/roles.permission';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly userPolicy: UserPolicy,
    private readonly rolesPermissionService: RolesPermissionService,
  ) {}

  async create(createUserDto: CreateUserDto, auth: AuthPayload) {
    const actorId = this.getActorId(auth);

    const permissionCode =
      createUserDto.scope === 'MITRA'
        ? userPermisionsCode.createMitraUser
        : userPermisionsCode.createInsidiaUser;
    const isMitraScope = createUserDto.scope === 'MITRA';
    const actor = await this.rolesPermissionService.hasPermission(actorId, {
      permission: permissionCode,
      scope: createUserDto.scope,
      requireMitraContext: isMitraScope,
      mitraId: isMitraScope ? createUserDto.mitraId : undefined,
    });
    this.userPolicy.canCreate(actor, {
      targetRoleCode: this.getTargetRoleCodeByScope(createUserDto),
      targetScope: createUserDto.scope,
    });
    try {
      await this.ensureUniqueEmail(createUserDto.email);
      await this.ensureUniquePhone(createUserDto.phone);

      if (createUserDto.mitraRole && !createUserDto.mitraId) {
        throw new ConflictException(
          'Mitra role tidak bisa diassign tanpa mitraId',
        );
      }
      if (isMitraScope && createUserDto.mitraId) {
        this.userPolicy.canManageMitraUser(
          actor.mitraRoles?.mitraId ?? createUserDto.mitraId,
          createUserDto.mitraId,
          actor,
        );
      }
      const createdUser = await this.userRepository.create(
        mapCreateUserData(createUserDto, actorId),
      );
      return serializeUserWithAccess(createdUser);
    } catch (error) {
      this.handleRepositoryError(error);
    }
  }
  async findAll({
    scope,
    filter,
    mitraId,
    auth,
  }: {
    scope: 'INSIDIA' | 'MITRA';
    filter?: UserFilter;
    mitraId?: string;
    auth: AuthPayload;
  }) {
    const actorId = this.getActorId(auth);
    const permissionCode =
      scope === 'MITRA' ? 'user.view.mitra.all' : 'user.view.insidia.all';
    const actor = await this.rolesPermissionService.hasPermission(actorId, {
      permission: permissionCode,
      scope,
      mitraId: mitraId,
    });
    const effectiveMitraId =
      scope === 'MITRA' ? (mitraId ?? actor.mitraRoles?.mitraId) : undefined;
    const isAdmin = actor.insidiaRole?.role.code === 'ADMIN';
    const users = isAdmin
      ? await this.userRepository.findAllByRoles({
          filter,
          roles: ['SUPER_ADMIN', 'ADMIN'],
          scope,
        })
      : filter === 'deleted'
        ? await this.userRepository.findAllDeleted(scope, effectiveMitraId)
        : filter === 'all'
          ? await this.userRepository.findAll(scope, effectiveMitraId)
          : await this.userRepository.findAllActive(scope, effectiveMitraId);

    const res = users.map((user) => serializeUserWithAccess(user));
    return res;
  }

  async findOne(
    id: string,
    auth: AuthPayload,
    scope: 'INSIDIA' | 'MITRA',
    mitraId?: string,
  ) {
    const user = await this.ensureActiveUserExists(id);
    const actorId = this.getActorId(auth);
    const permissionCode =
      scope === 'MITRA' ? 'user.viewone.mitra.all' : 'user.viewone.insidia.all';
    const isMitraScope = scope === 'MITRA';
    const effectiveMitraId = isMitraScope
      ? (mitraId ?? user.mitraRoles?.mitraId)
      : undefined;

    const actor = await this.rolesPermissionService.hasPermission(actorId, {
      permission: permissionCode,
      scope,
      mitraId: effectiveMitraId,
    });
    this.userPolicy.canView(actor, this.getExistingTargetRoleCode(user, scope));

    return serializeUserWithAccess(user);
  }

  async update(id: string, updateUserDto: UpdateUserDto, auth: AuthPayload) {
    const user = await this.ensureActiveUserExists(id);
    const actorId = this.getActorId(auth);
    const permissionCode =
      updateUserDto.scope === 'MITRA'
        ? userPermisionsCode.updateMitraUser
        : userPermisionsCode.updateInsidiaUser;
    const effectiveMitraId =
      updateUserDto.scope === 'MITRA'
        ? (updateUserDto.mitraId ?? user.mitraRoles?.mitraId)
        : undefined;
    const actor = await this.rolesPermissionService.hasPermission(actorId, {
      permission: permissionCode,
      scope: updateUserDto.scope,
      mitraId: effectiveMitraId,
      requireMitraContext: updateUserDto.scope === 'MITRA',
    });
    this.userPolicy.canUpdate(actor, {
      targetRoleCode: this.getTargetRoleCodeByScope(updateUserDto, user),
      targetScope: updateUserDto.scope,
    });
    if (updateUserDto.mitraRole && !updateUserDto.mitraId) {
      throw new ConflictException(
        'Mitra role tidak bisa diassign tanpa mitraId',
      );
    }
    if (updateUserDto.scope === 'MITRA' && effectiveMitraId) {
      this.userPolicy.canManageMitraUser(
        actor.mitraRoles?.mitraId ?? effectiveMitraId,
        effectiveMitraId,
        actor,
      );
    }
    await this.ensureLastAdminStillExistsAfterUpdate(user, updateUserDto);

    await this.ensureUniqueEmail(updateUserDto.email, id);
    await this.ensureUniquePhone(updateUserDto.phone, id);

    try {
      const updatedUser = await this.userRepository.updateActive(
        id,
        mapUpdateUserData(updateUserDto),
      );

      if (!updatedUser) {
        throw new NotFoundException('User tidak ditemukan');
      }

      return serializeUserWithAccess(updatedUser);
    } catch (error) {
      this.handleRepositoryError(error);
    }
  }

  async remove(
    id: string,
    auth: AuthPayload,
    scope: 'INSIDIA' | 'MITRA',
    mitraId?: string,
  ) {
    const actorId = this.getActorId(auth);
    const user = await this.ensureUserExists(id);
    const permissionCode =
      scope === 'MITRA'
        ? userPermisionsCode.deleteMitraUser
        : userPermisionsCode.deleteInsidiaUser;
    const effectiveMitraId =
      scope === 'MITRA' ? (mitraId ?? user.mitraRoles?.mitraId) : undefined;

    const actor = await this.rolesPermissionService.hasPermission(actorId, {
      permission: permissionCode,
      scope,
      mitraId: effectiveMitraId,
      requireMitraContext: scope === 'MITRA',
    });
    this.userPolicy.canUpdate(actor, {
      targetRoleCode: this.getExistingTargetRoleCode(user, scope),
      targetScope: scope,
    });

    if (user.deletedAt) {
      return { message: 'User sudah dihapus' };
    }

    this.ensureCanDeleteUser(user.id, actorId);
    await this.ensureNotDeletingLastAdmin(
      getInsidiaRoleCode(user),
      user.status,
    );

    const deleted = await this.userRepository.softDeleteActive(id);

    if (!deleted) {
      return { message: 'User sudah dihapus' };
    }

    return { message: 'User berhasil dihapus' };
  }
  async findRoleByUserId(userId: string) {
    await this.ensureUserExists(userId);
    return this.userRepository.findRoleByUserId(userId);
  }
  private getActorId(auth: AuthPayload) {
    if (!auth.sub) {
      throw new UnauthorizedException('Token tidak valid');
    }

    return auth.sub;
  }

  private async ensureUniqueEmail(email?: string, ignoredUserId?: string) {
    if (email === undefined) {
      return;
    }

    const existingUser = await this.userRepository.findByEmail(
      normalizeEmail(email),
    );

    if (existingUser && existingUser.id !== ignoredUserId) {
      throw new ConflictException('User dengan email tersebut sudah ada');
    }
  }

  private async ensureUniquePhone(
    phone?: string | null,
    ignoredUserId?: string,
  ) {
    if (phone === undefined || phone === null) {
      return;
    }

    const existingUser = await this.userRepository.findByPhone(phone);

    if (existingUser && existingUser.id !== ignoredUserId) {
      throw new ConflictException(
        'User dengan nomor telepon tersebut sudah ada',
      );
    }
  }

  async ensureUserExists(id: string) {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new NotFoundException('User tidak ditemukan');
    }

    return user;
  }

  private async ensureActiveUserExists(id: string) {
    const user = await this.userRepository.findActiveById(id);

    if (!user) {
      throw new NotFoundException('User tidak ditemukan');
    }

    return user;
  }

  private ensureCanDeleteUser(targetUserId: string, actorId: string) {
    if (targetUserId === actorId) {
      throw new ConflictException('Admin tidak bisa menghapus akun sendiri');
    }
  }

  private async ensureNotDeletingLastAdmin(
    roleCode: string | null,
    status: UserStatus,
  ) {
    if (
      !roleCode ||
      !adminRoleSet.has(roleCode) ||
      status !== UserStatus.ACTIVE
    ) {
      return;
    }

    const activeAdminCount = await this.userRepository.countActiveAdmins();

    if (activeAdminCount <= 1) {
      throw new ConflictException('Admin terakhir tidak boleh dihapus');
    }
  }

  private async ensureLastAdminStillExistsAfterUpdate(
    user: Awaited<ReturnType<UserService['ensureActiveUserExists']>>,
    updateUserDto: UpdateUserDto,
  ) {
    const currentRole = getInsidiaRoleCode(user);

    if (
      !currentRole ||
      !adminRoleSet.has(currentRole) ||
      user.status !== UserStatus.ACTIVE
    ) {
      return;
    }

    const nextRole = updateUserDto.role ?? currentRole;
    const nextStatus = updateUserDto.status ?? user.status;

    const losingAdminAccess =
      !adminRoleSet.has(nextRole) || nextStatus !== UserStatus.ACTIVE;

    if (!losingAdminAccess) {
      return;
    }

    const activeAdminCount = await this.userRepository.countActiveAdmins();

    if (activeAdminCount <= 1) {
      throw new ConflictException(
        'Admin terakhir tidak boleh kehilangan akses admin',
      );
    }
  }

  private handleRepositoryError(error: unknown): never {
    if (error instanceof DuplicateUserFieldError) {
      if (error.field === 'normalizedEmail') {
        throw new ConflictException('Email sudah digunakan');
      }

      if (error.field === 'phone') {
        throw new ConflictException('Nomor telepon sudah digunakan');
      }

      throw new ConflictException('Data user sudah digunakan');
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      throw new NotFoundException('Role user tidak ditemukan');
    }

    throw error;
  }

  private getTargetRoleCodeByScope(
    dto: {
      scope: 'INSIDIA' | 'MITRA';
      role?: string | null;
      mitraRole?: string | null;
    },
    user?: Awaited<ReturnType<UserService['ensureActiveUserExists']>>,
  ) {
    if (dto.scope === 'MITRA') {
      return dto.mitraRole ?? user?.mitraRoles?.role.code ?? null;
    }

    return dto.role ?? (user ? getInsidiaRoleCode(user) : null);
  }

  private getExistingTargetRoleCode(
    user: Awaited<ReturnType<UserService['ensureActiveUserExists']>>,
    scope: 'INSIDIA' | 'MITRA',
  ) {
    return scope === 'MITRA'
      ? user.mitraRoles?.role.code ?? null
      : getInsidiaRoleCode(user);
  }
}
