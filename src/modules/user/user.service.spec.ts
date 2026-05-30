import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { UserService } from './user.service';
import { UserRepository } from './user.repository';
import { DuplicateUserFieldError } from './user.errors';
import { UserPolicy } from './user.Policy';
import { RolesPermissionService } from '../roles/roles.permission';

describe('UserService', () => {
  let service: UserService;

  const actor = {
    insidiaRole: {
      role: {
        id: 'role-admin',
        code: 'ADMIN',
      },
    },
    mitraRoles: null,
  };

  const userRepository = {
    create: jest.fn(),
    findAllActive: jest.fn(),
    findById: jest.fn(),
    findActiveById: jest.fn(),
    findByEmail: jest.fn(),
    findByPhone: jest.fn(),
    updateActive: jest.fn(),
    softDeleteActive: jest.fn(),
    countActiveAdmins: jest.fn(),
    findRoleByUserId: jest.fn(),
  };

  const userPolicy = {
    canCreate: jest.fn(),
    canView: jest.fn(),
    canUpdate: jest.fn(),
    canManageMitraUser: jest.fn(),
  };

  const rolesPermissionService = {
    hasPermission: jest.fn(),
  };

  const auth = {
    sub: 'admin-1',
  } as never;

  beforeEach(async () => {
    jest.resetAllMocks();
    userRepository.findByEmail.mockResolvedValue(null);
    userRepository.findByPhone.mockResolvedValue(null);
    rolesPermissionService.hasPermission.mockResolvedValue(actor);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: UserRepository,
          useValue: userRepository,
        },
        {
          provide: UserPolicy,
          useValue: userPolicy,
        },
        {
          provide: RolesPermissionService,
          useValue: rolesPermissionService,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('creates a user with preserved email casing and creator relation', async () => {
    userRepository.create.mockResolvedValue({
      id: 'user-1',
      email: 'Admin@Example.com',
    });

    await service.create(
      {
        email: ' Admin@Example.com ',
        name: 'Admin',
        role: 'ADMIN',
        scope: 'INSIDIA',
        status: 'ACTIVE',
      },
      auth,
    );

    expect(userRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'Admin@Example.com',
        normalizedEmail: 'admin@example.com',
        name: 'Admin',
        createdBy: {
          connect: {
            id: 'admin-1',
          },
        },
        insidiaRole: expect.any(Object),
      }),
    );
  });

  it('throws not found when user detail does not exist', async () => {
    userRepository.findActiveById.mockResolvedValue(null);

    await expect(
      service.findOne('missing-id', auth, 'INSIDIA'),
    ).rejects.toThrow(new NotFoundException('User tidak ditemukan'));
  });

  it('soft deletes user when target is active', async () => {
    userRepository.findById.mockResolvedValue({
      id: 'user-1',
      status: 'ACTIVE',
      deletedAt: null,
      insidiaRole: {
        role: {
          code: 'USER',
        },
      },
      mitraRoles: null,
    });
    userRepository.softDeleteActive.mockResolvedValue(true);

    await expect(service.remove('user-1', auth, 'INSIDIA')).resolves.toEqual({
      message: 'User berhasil dihapus',
    });

    expect(userRepository.softDeleteActive).toHaveBeenCalledWith('user-1');
  });

  it('returns idempotent response when user is already soft deleted', async () => {
    userRepository.findById.mockResolvedValue({
      id: 'user-1',
      status: 'ACTIVE',
      deletedAt: new Date(),
      insidiaRole: {
        role: {
          code: 'USER',
        },
      },
      mitraRoles: null,
    });

    await expect(service.remove('user-1', auth, 'INSIDIA')).resolves.toEqual({
      message: 'User sudah dihapus',
    });
  });

  it('prevents admin from deleting their own account', async () => {
    userRepository.findById.mockResolvedValue({
      id: 'admin-1',
      status: 'ACTIVE',
      deletedAt: null,
      insidiaRole: {
        role: {
          code: 'ADMIN',
        },
      },
      mitraRoles: null,
    });

    await expect(service.remove('admin-1', auth, 'INSIDIA')).rejects.toThrow(
      new ConflictException('Admin tidak bisa menghapus akun sendiri'),
    );
  });

  it('prevents deleting the last active admin', async () => {
    userRepository.findById.mockResolvedValue({
      id: 'admin-2',
      status: 'ACTIVE',
      deletedAt: null,
      insidiaRole: {
        role: {
          code: 'ADMIN',
        },
      },
      mitraRoles: null,
    });
    userRepository.countActiveAdmins.mockResolvedValue(1);

    await expect(service.remove('admin-2', auth, 'INSIDIA')).rejects.toThrow(
      new ConflictException('Admin terakhir tidak boleh dihapus'),
    );
  });

  it('prevents last admin from losing admin access during update', async () => {
    userRepository.findActiveById.mockResolvedValue({
      id: 'admin-2',
      status: 'ACTIVE',
      deletedAt: null,
      insidiaRole: {
        role: {
          code: 'ADMIN',
        },
      },
      mitraRoles: null,
    });
    userRepository.countActiveAdmins.mockResolvedValue(1);

    await expect(
      service.update(
        'admin-2',
        {
          role: 'USER',
          scope: 'INSIDIA',
          status: 'ACTIVE',
        },
        auth,
      ),
    ).rejects.toThrow(
      new ConflictException(
        'Admin terakhir tidak boleh kehilangan akses admin',
      ),
    );
  });

  it('maps duplicate email errors to conflict exception', async () => {
    userRepository.create.mockRejectedValue(
      new DuplicateUserFieldError('normalizedEmail'),
    );

    await expect(
      service.create(
        {
          email: 'user@example.com',
          role: 'USER',
          scope: 'INSIDIA',
          status: 'ACTIVE',
        },
        auth,
      ),
    ).rejects.toThrow(new ConflictException('Email sudah digunakan'));
  });

  it('prevents updating phone to one that is already used', async () => {
    userRepository.findActiveById.mockResolvedValue({
      id: 'user-1',
      status: 'ACTIVE',
      deletedAt: null,
      insidiaRole: {
        role: {
          code: 'USER',
        },
      },
      mitraRoles: null,
    });
    userRepository.findByPhone.mockResolvedValue({
      id: 'user-2',
      phone: '08123',
    });

    await expect(
      service.update(
        'user-1',
        {
          phone: '08123',
          scope: 'INSIDIA',
        },
        auth,
      ),
    ).rejects.toThrow(
      new ConflictException('User dengan nomor telepon tersebut sudah ada'),
    );
  });

  it('maps duplicate phone errors during update to conflict exception', async () => {
    userRepository.findActiveById.mockResolvedValue({
      id: 'user-1',
      status: 'ACTIVE',
      deletedAt: null,
      insidiaRole: {
        role: {
          code: 'USER',
        },
      },
      mitraRoles: null,
    });
    userRepository.updateActive.mockRejectedValue(
      new DuplicateUserFieldError('phone'),
    );

    await expect(
      service.update(
        'user-1',
        {
          phone: '08123',
          scope: 'INSIDIA',
        },
        auth,
      ),
    ).rejects.toThrow(new ConflictException('Nomor telepon sudah digunakan'));
  });
});
