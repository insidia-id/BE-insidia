import { forwardRef, Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastruktur/prisma/prisma.module';
import { AccessTokenGuard } from '../../shared/guards/access-token.guard';
import { RolesGuard } from '../../shared/guards/admin-access.guard';
import { AuthModule } from '../auth/auth.module';
import { JwtTokenService } from '../auth/jwt-token.service';
import { PermissionsController } from './permissions.controller';
import { PermissionsRepository } from './permissions.repository';
import { PermissionsService } from './permissions.service';
import { RolesModule } from '../roles/roles.module';
import { PermissionsPolicy } from './permissions.policy';
import { BullmqModule } from '../../infrastruktur/queue/bullmq/bullmq.module';
import { BulkPermissionValidatorService } from './bulk-upload/bulk.modulepermisson.validator';
import { PreviewBulkPermissionUseCase } from './bulk-upload/preview.bulk.modulepermision';
import { EnqueueBulkPermissionImportUseCase } from './bulk-upload/enqueue-bulk-permission-import';
import { ProcessBulkPermissionImportUseCase } from './bulk-upload/process-bulk-permission-import';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    forwardRef(() => RolesModule),
    forwardRef(() => BullmqModule),
  ],
  controllers: [PermissionsController],
  providers: [
    PermissionsService,
    PermissionsPolicy,
    PermissionsRepository,
    JwtTokenService,
    AccessTokenGuard,
    RolesGuard,
    BulkPermissionValidatorService,
    PreviewBulkPermissionUseCase,
    EnqueueBulkPermissionImportUseCase,
    ProcessBulkPermissionImportUseCase,
  ],
  exports: [
    PermissionsService,
    PermissionsRepository,
    PermissionsPolicy,
    ProcessBulkPermissionImportUseCase,
  ],
})
export class PermissionsModule {}
