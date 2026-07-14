import 'dotenv/config';
import { Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly client: Redis;

  constructor() {
    const isUrl = !!process.env.REDIS_URL;

    this.client = isUrl
      ? new Redis(process.env.REDIS_URL!, {
          retryStrategy: (times) => Math.min(times * 50, 2000),
        })
      : new Redis({
          host: process.env.REDIS_HOST ?? 'localhost',
          port: Number(process.env.REDIS_PORT ?? 6379),
          password: process.env.REDIS_PASSWORD || undefined,
          db: Number(process.env.REDIS_DB ?? 0),

          retryStrategy: (times) => Math.min(times * 50, 2000),
        });

    this.client.on('error', (err) => {
      console.error('[Redis] error:', err.message);
    });
  }

  get instance() {
    return this.client;
  }

  async onModuleDestroy() {
    await this.client.quit().catch(() => undefined);
  }
  async getSession(userId: string) {
    const data = await this.client.get(`session:${userId}`);
    return data ? JSON.parse(data) : null;
  }

  async setSession(userId: string, data: any) {
    return this.client.set(`session:${userId}`, JSON.stringify(data));
  }

  async deleteSession(userId: string) {
    return this.client.del(`session:${userId}`);
  }
}
