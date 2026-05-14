import { forwardRef, Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastruktur/prisma/prisma.module';
import { AccessTokenGuard } from '../../shared/guards/access-token.guard';
import { RolesGuard } from '../../shared/guards/admin-access.guard';
import { JwtTokenService } from '../auth/jwt-token.service';
import { PermissionsModule } from '../permissions/permissions.module';
import { RolesController } from './roles.controller';
import { RolesRepository } from './roles.repository';
import { RolesService } from './roles.service';
import { RolesPermissionService } from './roles.permission';
import { UserModule } from '../user/user.module';

@Module({
  imports: [PrismaModule, PermissionsModule, forwardRef(() => UserModule)],
  controllers: [RolesController],
  providers: [
    RolesService,
    RolesRepository,
    JwtTokenService,
    AccessTokenGuard,
    RolesGuard,
    RolesPermissionService,
  ],
  exports: [RolesService, RolesRepository, RolesPermissionService],
})
export class RolesModule {}
