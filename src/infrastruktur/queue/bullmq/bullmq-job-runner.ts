import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { JobPayloadMap, JobRunner } from '../../../shared/jobs/job-contract';
import { JobType } from '../../../shared/jobs/jobs.types';

@Injectable()
export class BullmqJobRunner implements JobRunner {
  constructor(
    @InjectQueue('app-jobs')
    private readonly queue: Queue,
  ) {}

  async dispatch<T extends JobType>(
    type: T,
    payload: JobPayloadMap[T],
    options?: {
      jobId?: string;
      attempts?: number;
      delay?: number;
    },
  ): Promise<void> {
    await this.queue.add(type, payload, {
      jobId: options?.jobId,
      attempts: options?.attempts ?? 3,
      delay: options?.delay,
      backoff: {
        type: 'exponential',
        delay: 3000,
      },
      removeOnComplete: true,
      removeOnFail: false,
    });
  }
}
