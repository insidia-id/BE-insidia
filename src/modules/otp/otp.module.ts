import { Module } from '@nestjs/common';
import { RateLimitModule } from '../../shared/rate-limit/rate-limit.module';
import { RedisModule } from '../../infrastruktur/redis/redis.module';
import { OtpService } from './otp.service';
import { EmailModule } from '../../infrastruktur/email/email.module';

@Module({
  imports: [RedisModule, RateLimitModule, EmailModule],
  providers: [OtpService],
  exports: [OtpService],
})
export class OtpModule {}
