import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastruktur/prisma/prisma.module';
import { AccessTokenGuard } from '../../shared/guards/access-token.guard';
import { AuthModule } from '../auth/auth.module';
import { MitraModule } from '../mitra/mitra.module';
import { JwtTokenService } from '../auth/jwt-token.service';
import { RolesModule } from '../roles/roles.module';
import { MitraAcademicAccessService } from './shared/mitra-academic-access.service';
import { MitraAcademicRepository } from './mitra-academic.repository';
import { MitraAcademicPolicy } from './mitra-academic.policy';
@Module({
  imports: [PrismaModule, AuthModule, RolesModule, MitraModule],
  controllers: [],
  providers: [
    MitraAcademicAccessService,
    MitraAcademicRepository,
    JwtTokenService,
    AccessTokenGuard,
    MitraAcademicPolicy,
  ],
  exports: [
    MitraAcademicAccessService,
    MitraAcademicRepository,
    MitraAcademicPolicy,
  ],
})
export class MitraAcademicModule {}
