import { forwardRef, Module } from '@nestjs/common';
import { OtpModule } from '../otp/otp.module';
import { PrismaModule } from '../../infrastruktur/prisma/prisma.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AuthRepository } from './auth.repository';
import { AccessTokenGuard } from '../../shared/guards/access-token.guard';
import { InternalTokenGuard } from '../../shared/guards/internal-token.guard';
import { JwtTokenService } from './jwt-token.service';
import { RedisModule } from 'src/infrastruktur/redis/redis.module';

@Module({
  imports: [PrismaModule, OtpModule, forwardRef(() => RedisModule)],
  controllers: [AuthController],
  providers: [
    AuthService,
    AuthRepository,
    JwtTokenService,
    AccessTokenGuard,
    InternalTokenGuard,
  ],
  exports: [AuthService, AuthRepository],
})
export class AuthModule {}
