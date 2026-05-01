import { Module } from '@nestjs/common';
import { OtpModule } from '../otp/otp.module';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AuthRepository } from './auth.repository';
import { AccessTokenGuard } from '../guards/access-token.guard';
import { InternalTokenGuard } from '../guards/internal-token.guard';
import { JwtTokenService } from './jwt-token.service';

@Module({
  imports: [PrismaModule, OtpModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    AuthRepository,
    JwtTokenService,
    AccessTokenGuard,
    InternalTokenGuard,
  ],
})
export class AuthModule {}
