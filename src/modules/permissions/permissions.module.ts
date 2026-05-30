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

@Module({
  imports: [PrismaModule, AuthModule, forwardRef(() => RolesModule)],
  controllers: [PermissionsController],
  providers: [
    PermissionsService,
    PermissionsPolicy,
    PermissionsRepository,
    JwtTokenService,
    AccessTokenGuard,
    RolesGuard,
  ],
  exports: [PermissionsService, PermissionsRepository, PermissionsPolicy],
})
export class PermissionsModule {}
