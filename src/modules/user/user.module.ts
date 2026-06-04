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
@Module({
  imports: [
    PrismaModule,
    forwardRef(() => RolesModule),
    AuthModule,
    forwardRef(() => BullmqModule),
  ],
  controllers: [UserController],
  providers: [
    UserService,
    UserRepository,
    JwtTokenService,
    RolesGuard,
    UserPolicy,
    BulkUserValidatorService,
    PreviewBulkUserUseCase,
    EnqueueBulkUserImportUseCase,
    ProcessBulkUserImportUseCase,
  ],
  exports: [UserService, UserRepository, ProcessBulkUserImportUseCase],
})
export class UserModule {}
