import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { JobType } from '../../../../shared/jobs/jobs.types';
import { JobPayloadMap } from '../../../../shared/jobs/job-contract';
import { ProcessBulkUserImportUseCase } from '../../../../modules/user/bulk-upload/process-bulk-user-import';

@Processor('app-jobs')
export class UserBulkImportProcessor extends WorkerHost {
  constructor(
    private readonly processBulkUserImportUseCase: ProcessBulkUserImportUseCase,
  ) {
    super();
  }

  async process(job: Job) {
    if (job.name !== JobType.USER_BULK_IMPORT) {
      return;
    }

    const payload = job.data as JobPayloadMap[JobType.USER_BULK_IMPORT];

    return this.processBulkUserImportUseCase.execute(payload.jobId);
  }
}
