import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { BullmqModule } from './bullmq/bullmq.module';

@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'redis',
        port: Number(process.env.REDIS_PORT || 6379),
      },
    }),

    BullmqModule,
  ],
  exports: [BullmqModule],
})
export class QueueModule {}
