import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastruktur/prisma/prisma.module';
import { AccessTokenGuard } from '../../shared/guards/access-token.guard';
import { RolesGuard } from '../../shared/guards/admin-access.guard';
import { JwtTokenService } from '../auth/jwt-token.service';
import { PermissionsController } from './permissions.controller';
import { PermissionsRepository } from './permissions.repository';
import { PermissionsService } from './permissions.service';

@Module({
  imports: [PrismaModule],
  controllers: [PermissionsController],
  providers: [
    PermissionsService,
    PermissionsRepository,
    JwtTokenService,
    AccessTokenGuard,
    RolesGuard,
  ],
  exports: [PermissionsService, PermissionsRepository],
})
export class PermissionsModule {}
