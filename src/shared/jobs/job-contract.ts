import { JobType } from './jobs.types';

export type JobPayloadMap = {
  [JobType.USER_BULK_IMPORT]: {
    jobId: string;
  };
  [JobType.COURSE_BULK_IMPORT]: {
    jobId: string;
  };
};

export interface JobRunner {
  dispatch<T extends JobType>(
    type: T,
    payload: JobPayloadMap[T],
    options?: {
      jobId?: string;
      attempts?: number;
      delay?: number;
    },
  ): Promise<void>;
}

export const JOB_RUNNER = Symbol('JOB_RUNNER');
