import { forwardRef, Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaModule } from '../../infrastruktur/prisma/prisma.module';
import { JwtTokenService } from '../auth/jwt-token.service';
import { RolesGuard } from '../../shared/guards/admin-access.guard';
import { UserRepository } from './user.repository';
import { UserPolicy } from './user.Policy';
import { RolesModule } from '../roles/roles.module';
import { AuthModule } from '../auth/auth.module';
import { BullmqModule } from '../../infrastruktur/queue/bullmq/bullmq.module';
import { BulkUserValidatorService } from './bulk-upload/bulk-user-validator';
import { PreviewBulkUserUseCase } from './bulk-upload/preview-bulk-user';
import { EnqueueBulkUserImportUseCase } from './bulk-upload/enqueue-bulk-user-import';
import { ProcessBulkUserImportUseCase } from './bulk-upload/process-bulk-user-import';
import { BulkUserTemplateGeneratorService } from './bulk-upload/bulk-user-template-generator.service';
import { RedisModule } from 'src/infrastruktur/redis/redis.module';
@Module({
  imports: [
    PrismaModule,
    forwardRef(() => RolesModule),
    forwardRef(() => AuthModule),
    forwardRef(() => BullmqModule),
    forwardRef(() => RedisModule),
  ],
  controllers: [UserController],
  providers: [
    UserService,
    UserRepository,
    JwtTokenService,
    RolesGuard,
    UserPolicy,
    BulkUserValidatorService,
    BulkUserTemplateGeneratorService,
    PreviewBulkUserUseCase,
    EnqueueBulkUserImportUseCase,
    ProcessBulkUserImportUseCase,
  ],
  exports: [UserService, UserRepository, ProcessBulkUserImportUseCase],
})
export class UserModule {}
