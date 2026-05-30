import { forwardRef, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { JOB_RUNNER } from '../../../shared/jobs/job-contract';
import { BullmqJobRunner } from './bullmq-job-runner';
import { UserBulkImportProcessor } from './processors/user-bulk-import.processor';
import { UserModule } from '../../../modules/user/user.module';
import { BulkUploadRepository } from './bulk-upload.repository';
import { PrismaModule } from '../../prisma/prisma.module';
@Module({
  imports: [
    BullModule.registerQueue({
      name: 'app-jobs',
    }),

    PrismaModule,
    forwardRef(() => UserModule),
  ],
  providers: [
    {
      provide: JOB_RUNNER,
      useClass: BullmqJobRunner,
    },
    BulkUploadRepository,
    UserBulkImportProcessor,
  ],
  exports: [JOB_RUNNER, BulkUploadRepository],
})
export class BullmqModule {}
