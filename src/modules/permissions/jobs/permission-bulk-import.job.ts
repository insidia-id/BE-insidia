import { JobType } from '../../../shared/jobs/jobs.types';
import { JobPayloadMap } from '../../../shared/jobs/job-contract';

export const PermissionBulkImportJob = {
  type: JobType.PERMISSION_BULK_IMPORT,

  createPayload(jobId: string): JobPayloadMap[JobType.PERMISSION_BULK_IMPORT] {
    return {
      jobId,
    };
  },
};
