import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';

import { Injectable, Logger, OnModuleInit } from '@nestjs/common';

import { Job } from 'bullmq';

import { JobType } from '../../../../shared/jobs/jobs.types';

import { JobPayloadMap } from '../../../../shared/jobs/job-contract';

import { ProcessBulkUserImportUseCase } from '../../../../modules/user/bulk-upload/process-bulk-user-import';

@Injectable()
@Processor('app-jobs')
export class UserBulkImportProcessor extends WorkerHost {
  constructor(
    private readonly processBulkUserImportUseCase: ProcessBulkUserImportUseCase,
  ) {
    super();
  }

  async process(job: Job) {
    try {
      const payload = job.data as JobPayloadMap[JobType.USER_BULK_IMPORT];

      const result = await this.processBulkUserImportUseCase.execute(
        payload.jobId,
      );

      return result;
    } catch (err) {
      const message = err instanceof Error ? err.stack : String(err);

      throw err;
    }
  }
}
