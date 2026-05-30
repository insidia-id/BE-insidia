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

@Module({
  imports: [PrismaModule, forwardRef(() => RolesModule), AuthModule],
  controllers: [UserController],
  providers: [
    UserService,
    UserRepository,
    JwtTokenService,
    RolesGuard,
    UserPolicy,
  ],
  exports: [UserService, UserRepository],
})
export class UserModule {}
