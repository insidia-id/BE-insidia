import 'dotenv/config';

import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly client: Redis;

  constructor() {
    const options = {
      lazyConnect: true,
      maxRetriesPerRequest: 1,
      enableOfflineQueue: false,
    } as const;

    const redisUrl = process.env.REDIS_URL;

    this.client = redisUrl
      ? new Redis(redisUrl, options)
      : new Redis({
          host: process.env.REDIS_HOST ?? 'localhost',
          port: Number(process.env.REDIS_PORT ?? 6379),
          password: process.env.REDIS_PASS || undefined,
          db: Number(process.env.REDIS_DB ?? 0),
          ...options,
        });

    this.client.on('error', (error) => {
      console.error('[Redis] connection error:', error.message);
    });
  }

  get instance() {
    return this.client;
  }

  async onModuleInit() {
    if (this.client.status === 'wait') {
      try {
        await this.client.connect();
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'unknown redis error';
        console.error('[Redis] initial connect failed:', message);
      }
    }
  }

  async onModuleDestroy() {
    if (this.client.status === 'end') {
      return;
    }

    await this.client.quit().catch(() => undefined);
  }
}
