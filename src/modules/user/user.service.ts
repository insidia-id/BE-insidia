import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
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
import { SessionRedisService } from 'src/infrastruktur/redis/session.redis.service';
import { UserSession } from '../auth/auth.types';
import { RoleCode } from '../../shared/types/types';
@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly userPolicy: UserPolicy,
    private readonly rolesPermissionService: RolesPermissionService,
    private readonly sessionRedis: SessionRedisService,
  ) {}

  async create(createUserDto: CreateUserDto, auth: AuthPayload) {
    const actorId = this.getActorId(auth);

    const permissionCode =
      createUserDto.scope === 'MITRA'
        ? userPermisionsCode.createMitraUser
        : userPermisionsCode.createInsidiaUser;

    const isMitraScope = createUserDto.scope === 'MITRA';

    const targetMitraIds = [
      ...new Set(createUserDto.mitraRoles?.map((item) => item.mitraId) ?? []),
    ];

    const effectiveMitraId =
      createUserDto.scope === 'MITRA' ? targetMitraIds[0] : undefined;

    const actor = await this.rolesPermissionService.hasPermission(actorId, {
      permission: permissionCode,
      scope: createUserDto.scope,
      requireMitraContext: isMitraScope,
      mitraId: isMitraScope ? effectiveMitraId : undefined,
    });

    this.userPolicy.canCreate(
      actor,
      {
        targetRoleCode: this.getTargetRoleCodeByScope(createUserDto),
        targetScope: createUserDto.scope,
      },
      effectiveMitraId ?? null,
    );
    try {
      await this.ensureUniqueEmail(createUserDto.email);
      await this.ensureUniquePhone(createUserDto.phone);
      await this.ensureUniqueNik(createUserDto.nik);

      if (isMitraScope && effectiveMitraId) {
        this.userPolicy.canManageMitraUser(effectiveMitraId, actor);
      }

      const data = mapCreateUserData(createUserDto, actorId);

      const createdUser = await this.userRepository.create(data);

      return createdUser;
    } catch (error) {
      this.handleRepositoryError(error);
    }
  }
  async findAll({
    auth,
    session,
    scope,
    filter,
    roleCode,
  }: {
    scope: 'INSIDIA' | 'MITRA';
    auth: AuthPayload;
    session: UserSession;
    filter?: UserFilter;
    roleCode?: RoleCode;
  }) {
    const actorId = this.getActorId(auth);
    const permissionCode =
      scope === 'MITRA' ? 'user.view.mitra.all' : 'user.view.insidia.all';
    const actor = await this.rolesPermissionService.hasPermission(actorId, {
      permission: permissionCode,
      scope,
      mitraId: session.activeMitraId ?? undefined,
    });
    const effectiveMitraId =
      scope === 'MITRA' ? session.activeMitraId : undefined;
    const isAdmin = actor.insidiaRole?.role.code === 'ADMIN';
    const excludeRoles: RoleCode[] | undefined = isAdmin
      ? ['SUPER_ADMIN', 'ADMIN']
      : undefined;
    const normalizedRoleCode =
      roleCode && roleCode !== 'ALL' ? roleCode : undefined;

    const { users, total } = await this.userRepository.findAll({
      scope,
      filter,
      mitraId: effectiveMitraId,
      roleCode: normalizedRoleCode,
      excludeRoles: excludeRoles,
    });
    const res = {
      users: users.map((user) => serializeUserWithAccess(user)),
      total,
    };
    return res;
  }

  async findOne(
    id: string,
    auth: AuthPayload,
    scope: 'INSIDIA' | 'MITRA',
    session: UserSession,
  ) {
    const user = await this.ensureActiveUserExists(id);
    const actorId = this.getActorId(auth);
    const permissionCode =
      scope === 'MITRA' ? 'user.viewone.mitra.all' : 'user.viewone.insidia.all';
    const isMitraScope = scope === 'MITRA';
    const effectiveMitraId = isMitraScope ? session.activeMitraId : undefined;

    const actor = await this.rolesPermissionService.hasPermission(actorId, {
      permission: permissionCode,
      scope,
      mitraId: effectiveMitraId ?? undefined,
    });

    this.userPolicy.canView(
      actor,
      this.getExistingTargetRoleCode(user, scope, effectiveMitraId ?? null),
      effectiveMitraId ?? null,
      scope,
    );

    const res = serializeUserWithAccess(user);
    return res;
  }

  async update(id: string, updateUserDto: UpdateUserDto, auth: AuthPayload) {
    const user = await this.ensureActiveUserExists(id);
    const actorId = this.getActorId(auth);

    const permissionCode =
      updateUserDto.scope === 'MITRA'
        ? userPermisionsCode.updateMitraUser
        : userPermisionsCode.updateInsidiaUser;

    const targetMitraIds = [
      ...new Set(updateUserDto.mitraRoles?.map((item) => item.mitraId) ?? []),
    ];

    const effectiveMitraId =
      updateUserDto.scope === 'MITRA' ? targetMitraIds[0] : undefined;

    if (updateUserDto.scope === 'MITRA' && !effectiveMitraId) {
      throw new BadRequestException('mitraId wajib diisi jika scope MITRA');
    }

    const actor = await this.rolesPermissionService.hasPermission(actorId, {
      permission: permissionCode,
      scope: updateUserDto.scope,
      mitraId: effectiveMitraId,
      requireMitraContext: updateUserDto.scope === 'MITRA',
    });

    this.userPolicy.canUpdate(
      actor,
      {
        targetRoleCode: this.getTargetRoleCodeByScope(updateUserDto, user),
        targetScope: updateUserDto.scope,
      },
      effectiveMitraId ?? null,
    );

    if (updateUserDto.scope === 'MITRA' && effectiveMitraId) {
      this.userPolicy.canManageMitraUser(effectiveMitraId, actor);
    }

    await this.ensureLastAdminStillExistsAfterUpdate(user, updateUserDto);
    await this.ensureLastAkademikStillExistsAfterUpdate(user, updateUserDto);
    await this.ensureUniqueEmail(updateUserDto.email, id);
    await this.ensureUniquePhone(updateUserDto.phone, id);
    await this.ensureUniqueNik(updateUserDto.nik, id);
    try {
      const updatedUser = await this.userRepository.updateActive(
        id,
        mapUpdateUserData(updateUserDto, id),
      );

      if (!updatedUser) {
        throw new NotFoundException('User tidak ditemukan');
      }
      const session = await this.sessionRedis.get(user.id);
      await this.sessionRedis.patch(user.id, {
        activeMitraId:
          updateUserDto.mitraRoles?.[0]?.mitraId ??
          session?.activeMitraId ??
          null,
        activeRoleCode:
          updateUserDto.mitraRoles?.[0]?.roleCode ??
          session?.activeRoleCode ??
          null,
        lastSwitchAt: Date.now(),
      });
      if (!session) {
        await this.sessionRedis.set(user.id, {
          userId: user.id,
          activeMitraId: updateUserDto.mitraRoles?.[0]?.mitraId ?? null,
          activeRoleCode: updateUserDto.mitraRoles?.[0]?.roleCode ?? null,
          lastSwitchAt: Date.now(),
          version: 1,
        });
      }
      return updatedUser;
    } catch (error) {
      this.handleRepositoryError(error);
    }
  }

  async remove(
    id: string,
    auth: AuthPayload,
    scope: 'INSIDIA' | 'MITRA',
    session: UserSession,
  ) {
    const actorId = this.getActorId(auth);
    const user = await this.ensureUserExists(id);
    const activeMitraId = session.activeMitraId;
    const permissionCode =
      scope === 'MITRA'
        ? userPermisionsCode.deleteMitraUser
        : userPermisionsCode.deleteInsidiaUser;
    const effectiveMitraId =
      scope === 'MITRA'
        ? (activeMitraId ??
          user.mitraRoles?.find((r) => r.mitraId === activeMitraId)?.mitraId)
        : undefined;

    const actor = await this.rolesPermissionService.hasPermission(actorId, {
      permission: permissionCode,
      scope,
      mitraId: effectiveMitraId,
      requireMitraContext: scope === 'MITRA',
    });
    this.userPolicy.canUpdate(
      actor,
      {
        targetRoleCode: this.getExistingTargetRoleCode(
          user,
          scope,
          effectiveMitraId ?? null,
        ),
        targetScope: scope,
      },
      effectiveMitraId ?? null,
    );

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

  async deleteUserMitraRoles(
    auth: AuthPayload,
    userId: string,
    session: UserSession,
    mitraId: string,
  ) {
    const actorId = this.getActorId(auth);
    const activeMitraId = session.activeMitraId;

    try {
      await this.ensureUserExists(userId);

      const actor = await this.rolesPermissionService.hasPermission(actorId, {
        permission: userPermisionsCode.deleteMitraUser,
        scope: 'MITRA',
        mitraId: activeMitraId ?? undefined,
        requireMitraContext: true,
      });

      this.userPolicy.canManageMitraUser(mitraId, actor);
      await this.userRepository.deleteUserMitraRoles(userId, mitraId);
      const session = await this.sessionRedis.get(userId);

      if (session?.activeMitraId === activeMitraId) {
        await this.sessionRedis.patch(userId, {
          activeMitraId: null,
          activeRoleCode: null,
          lastSwitchAt: Date.now(),
        });
      }
    } catch (error) {
      this.handleRepositoryError(error);
    }
  }

  async switchMitra(userId: string, mitraId: string) {
    const access = await this.userRepository.findUserMitraRoleByMitraId(
      userId,
      mitraId,
    );

    if (!access) {
      throw new ForbiddenException('Tidak punya akses ke mitra ini');
    }

    return this.sessionRedis.patch(userId, {
      activeMitraId: mitraId,
      activeRoleCode: access.role.code,
      lastSwitchAt: Date.now(),
    });
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
  private async ensureUniqueNik(nik?: string | null, ignoredUserId?: string) {
    if (nik === undefined || nik === null) {
      return;
    }

    const existingUser = await this.userRepository.findByNik(nik);

    if (existingUser && existingUser.id !== ignoredUserId) {
      throw new ConflictException('User dengan NIK tersebut sudah ada');
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
  private async ensureLastAkademikStillExistsAfterUpdate(
    user: Awaited<ReturnType<UserService['ensureActiveUserExists']>>,
    updateUserDto: UpdateUserDto,
  ) {
    if (user.status !== UserStatus.ACTIVE) {
      return;
    }

    const currentAkademikMitraRoles =
      user.mitraRoles?.filter((r) => r.role.code === 'AKADEMIK') ?? [];

    if (currentAkademikMitraRoles.length === 0) {
      return;
    }

    const nextStatus = updateUserDto.status ?? user.status;

    const updatedMitraRoleMap = new Map(
      updateUserDto.mitraRoles?.map((item) => [item.mitraId, item.roleCode]) ??
        [],
    );

    const affectedMitraIds = [
      ...new Set(
        currentAkademikMitraRoles
          .filter((currentMitraRole) => {
            const nextRole =
              updatedMitraRoleMap.get(currentMitraRole.mitraId) ??
              currentMitraRole.role.code;

            const losingAkademikAccess =
              nextRole !== 'AKADEMIK' || nextStatus !== UserStatus.ACTIVE;

            return losingAkademikAccess;
          })
          .map((item) => item.mitraId),
      ),
    ];

    if (affectedMitraIds.length === 0) {
      return;
    }

    for (const mitraId of affectedMitraIds) {
      const activeAkademikCount =
        await this.userRepository.countActiveAkademikByMitraId(mitraId);

      if (activeAkademikCount <= 1) {
        throw new ConflictException(
          'User akademik terakhir tidak boleh kehilangan akses akademik',
        );
      }
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
      mitraRoles?: {
        mitraId: string;
        roleCode: string;
      }[];
    },
    user?: Awaited<ReturnType<UserService['ensureActiveUserExists']>>,
  ) {
    if (dto.scope === 'MITRA') {
      return (
        dto.mitraRoles?.[0]?.roleCode ??
        user?.mitraRoles?.[0]?.role.code ??
        null
      );
    }

    return dto.role ?? (user ? getInsidiaRoleCode(user) : null);
  }

  private getExistingTargetRoleCode(
    user: Awaited<ReturnType<UserService['ensureActiveUserExists']>>,
    scope: 'INSIDIA' | 'MITRA',
    mitraId: string | null,
  ) {
    return scope === 'MITRA'
      ? (user.mitraRoles?.find((r) => r.mitraId === mitraId)?.role.code ?? null)
      : getInsidiaRoleCode(user);
  }
}
