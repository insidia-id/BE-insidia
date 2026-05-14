import {
  HttpException,
  HttpStatus,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { RateLimiterRedis } from 'rate-limiter-flexible';
import { RedisService } from '../../infrastruktur/redis/redis.service';

type RateLimitOptions = {
  keyPrefix: string;
  points: number;
  durationSeconds: number;
  blockDurationSeconds?: number;
};

@Injectable()
export class RateLimitService {
  private readonly limiters = new Map<string, RateLimiterRedis>();

  constructor(private readonly redisService: RedisService) {}

  async consume(options: RateLimitOptions, key: string) {
    const limiter = this.getLimiter(options);

    try {
      await limiter.consume(key);
    } catch (error) {
      const msBeforeNext = (error as { msBeforeNext?: number }).msBeforeNext;

      if (typeof msBeforeNext !== 'number') {
        throw new ServiceUnavailableException('Rate limiter tidak tersedia');
      }

      throw new HttpException(
        `Silakan coba lagi dalam ${Math.ceil(msBeforeNext / 1000)} detik`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }

  private getLimiter(options: RateLimitOptions) {
    const cacheKey = JSON.stringify(options);
    const existing = this.limiters.get(cacheKey);

    if (existing) {
      return existing;
    }

    const limiter = new RateLimiterRedis({
      storeClient: this.redisService.instance,
      keyPrefix: options.keyPrefix,
      points: options.points,
      duration: options.durationSeconds,
      blockDuration: options.blockDurationSeconds,
    });

    this.limiters.set(cacheKey, limiter);
    return limiter;
  }
}
