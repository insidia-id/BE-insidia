import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { PreviewBulkUserUseCase } from './bulk-upload/preview-bulk-user';
import { EnqueueBulkUserImportUseCase } from './bulk-upload/enqueue-bulk-user-import';

describe('UserController', () => {
  let controller: UserController;

  const userService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const previewBulkUserUseCase = {
    execute: jest.fn(),
  };

  const enqueueBulkUserImportUseCase = {
    execute: jest.fn(),
  };

  beforeEach(async () => {
    jest.resetAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: userService,
        },
        {
          provide: PreviewBulkUserUseCase,
          useValue: previewBulkUserUseCase,
        },
        {
          provide: EnqueueBulkUserImportUseCase,
          useValue: enqueueBulkUserImportUseCase,
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('passes auth payload when creating user', async () => {
    const dto = {
      email: 'user@example.com',
      role: 'USER',
      scope: 'INSIDIA' as const,
      status: 'ACTIVE' as const,
    };
    const request = {
      auth: {
        sub: 'admin-1',
      },
    } as any;

    await controller.create(dto, request);

    expect(userService.create).toHaveBeenCalledWith(dto, request.auth);
  });

  it('passes string id and auth payload to update', async () => {
    const dto = {
      name: 'Updated User',
      scope: 'INSIDIA' as const,
    };
    const request = {
      auth: {
        sub: 'admin-1',
      },
    } as any;

    await controller.update('cuid-user-id', dto, request);

    expect(userService.update).toHaveBeenCalledWith(
      'cuid-user-id',
      dto,
      request.auth,
    );
  });

  it('passes auth payload and query context when deleting user', async () => {
    const request = {
      auth: {
        sub: 'admin-1',
      },
    } as any;

    await controller.remove(request, 'cuid-user-id', 'MITRA', 'mitra-1');

    expect(userService.remove).toHaveBeenCalledWith(
      'cuid-user-id',
      request.auth,
      'MITRA',
      'mitra-1',
    );
  });
});
