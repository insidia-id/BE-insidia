import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { JobType } from '../../../../shared/jobs/jobs.types';
import { JobPayloadMap } from '../../../../shared/jobs/job-contract';
import { ProcessBulkPermissionImportUseCase } from '../../../../modules/permissions/bulk-upload/process-bulk-permission-import';

@Processor('app-jobs')
export class PermissionBulkImportProcessor extends WorkerHost {
  constructor(
    private readonly processBulkPermissionImportUseCase: ProcessBulkPermissionImportUseCase,
  ) {
    super();
    console.log('PermissionBulkImportProcessor initialized');
  }

  async process(job: Job) {
    try {
      const payload = job.data as JobPayloadMap[JobType.PERMISSION_BULK_IMPORT];
      const result = await this.processBulkPermissionImportUseCase.execute(
        payload.jobId,
      );
      return result;
    } catch (error) {
      console.error(`Error processing job ${job.id}:`, error);
      throw error;
    }
  }
}
