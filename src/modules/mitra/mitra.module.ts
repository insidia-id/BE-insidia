import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastruktur/prisma/prisma.module';
import { AccessTokenGuard } from '../../shared/guards/access-token.guard';
import { RolesGuard } from '../../shared/guards/admin-access.guard';
import { AuthModule } from '../auth/auth.module';
import { JwtTokenService } from '../auth/jwt-token.service';
import { MitraController } from './mitra.controller';
import { MitraRepository } from './mitra.repository';
import { MitraService } from './mitra.service';
import { RolesModule } from '../roles/roles.module';

@Module({
  imports: [PrismaModule, AuthModule, RolesModule],
  controllers: [MitraController],
  providers: [
    MitraService,
    MitraRepository,
    JwtTokenService,
    AccessTokenGuard,
    RolesGuard,
  ],
  exports: [MitraService, MitraRepository],
})
export class MitraModule {}
