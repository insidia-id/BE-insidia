import { Global, Module } from '@nestjs/common';
import { RedisService } from './redis.service';
import { SessionRedisService } from './session.redis.service';
import { forwardRef } from '@nestjs/common';
import { UserModule } from 'src/modules/user/user.module';
@Global()
@Module({
  imports: [forwardRef(() => UserModule)],
  providers: [RedisService, SessionRedisService],
  exports: [RedisService, SessionRedisService],
})
export class RedisModule {}
