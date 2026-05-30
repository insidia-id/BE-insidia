import { JobType } from '../../../shared/jobs/jobs.types';
import { JobPayloadMap } from '../../../shared/jobs/job-contract';

export const UserBulkImportJob = {
  type: JobType.USER_BULK_IMPORT,

  createPayload(jobId: string): JobPayloadMap[JobType.USER_BULK_IMPORT] {
    return {
      jobId,
    };
  },
};
