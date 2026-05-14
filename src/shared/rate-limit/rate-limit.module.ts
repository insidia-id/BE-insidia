import { Module } from '@nestjs/common';
import { RedisModule } from '../../infrastruktur/redis/redis.module';
import { RateLimitService } from './rate-limit.service';

@Module({
  imports: [RedisModule],
  providers: [RateLimitService],
  exports: [RateLimitService],
})
export class RateLimitModule {}
