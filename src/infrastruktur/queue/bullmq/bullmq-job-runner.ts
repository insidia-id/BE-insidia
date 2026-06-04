import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bullmq';
import { JobPayloadMap, JobRunner } from '../../../shared/jobs/job-contract';
import { JobType } from '../../../shared/jobs/jobs.types';

@Injectable()
export class BullmqJobRunner implements JobRunner {
  private readonly logger = new Logger(BullmqJobRunner.name);

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
    this.logger.debug(
      `Queue dispatch start name=${type} jobId=${options?.jobId ?? 'auto'}`,
    );

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

    await this.logQueueState(`after-add name=${type}`);
  }

  private async logQueueState(context: string) {
    const counts = await this.queue.getJobCounts();
    const waiting = await this.queue.getWaiting();
    const active = await this.queue.getActive();
    const failed = await this.queue.getFailed();

    const waitingSummary = waiting
      .slice(0, 5)
      .map((job) => `${job.id}:${job.name}`)
      .join(', ');
    const activeSummary = active
      .slice(0, 5)
      .map((job) => `${job.id}:${job.name}`)
      .join(', ');
    const failedSummary = failed
      .slice(0, 5)
      .map((job) => `${job.id}:${job.name}`)
      .join(', ');

    this.logger.debug(
      `Queue state (${context}) counts=${JSON.stringify(counts)}`,
    );
    this.logger.debug(`Queue waiting=${waiting.length} [${waitingSummary}]`);
    this.logger.debug(`Queue active=${active.length} [${activeSummary}]`);
    this.logger.debug(`Queue failed=${failed.length} [${failedSummary}]`);
  }
}
