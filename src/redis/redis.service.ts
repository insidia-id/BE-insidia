import 'dotenv/config';

import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly client = new Redis({
    host: process.env.REDIS_HOST ?? 'localhost',
    port: Number(process.env.REDIS_PORT ?? 6379),
    password: process.env.REDIS_PASS || undefined,
    db: Number(process.env.REDIS_DB ?? 0),
    lazyConnect: true,
    maxRetriesPerRequest: 1,
    enableOfflineQueue: false,
  });

  get instance() {
    return this.client;
  }

  async onModuleInit() {
    if (this.client.status === 'wait') {
      await this.client.connect();
    }
  }

  async onModuleDestroy() {
    await this.client.quit();
  }
}
