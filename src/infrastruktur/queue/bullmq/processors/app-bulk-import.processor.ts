import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { JobType } from '../../../../shared/jobs/jobs.types';
import { JobPayloadMap } from '../../../../shared/jobs/job-contract';
import { ProcessBulkPermissionImportUseCase } from '../../../../modules/permissions/bulk-upload/process-bulk-permission-import';
import { ProcessBulkUserImportUseCase } from 'src/modules/user/bulk-upload/process-bulk-user-import';

@Processor('app-jobs')
export class AppJobProcessor extends WorkerHost {
  constructor(
    private readonly processBulkPermissionImportUseCase: ProcessBulkPermissionImportUseCase,
    private readonly processBulkUserImportUseCase: ProcessBulkUserImportUseCase,
  ) {
    super();
  }

  async process(job: Job) {
    switch (job.name) {
      case JobType.PERMISSION_BULK_IMPORT:
        return this.handlePermissionBulkImport(job);
      case JobType.USER_BULK_IMPORT:
        return this.handleUserBulkImport(job);
      default:
        throw new Error(`Unsupported job type: ${job.name}`);
    }
  }

  private async handlePermissionBulkImport(job: Job) {
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
  private async handleUserBulkImport(job: Job) {
    try {
      const payload = job.data as JobPayloadMap[JobType.USER_BULK_IMPORT];

      const result = await this.processBulkUserImportUseCase.execute(
        payload.jobId,
      );

      return result;
    } catch (error) {
      console.error(`Error processing job ${job.id}:`, error);
      throw error;
    }
  }
}
