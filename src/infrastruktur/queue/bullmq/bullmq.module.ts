import { forwardRef, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { JOB_RUNNER } from '../../../shared/jobs/job-contract';
import { BullmqJobRunner } from './bullmq-job-runner';
import { UserModule } from '../../../modules/user/user.module';
import { PermissionsModule } from '../../../modules/permissions/permissions.module';
import { BulkUploadRepository } from './bulk-upload.repository';
import { PrismaModule } from '../../prisma/prisma.module';
import { BulkService } from './bulk.service';
import { BulkParserService } from './bulk-parser';
import { AppJobProcessor } from './processors/app-bulk-import.processor';
@Module({
  imports: [
    BullModule.registerQueue({
      name: 'app-jobs',
    }),

    PrismaModule,
    forwardRef(() => UserModule),
    forwardRef(() => PermissionsModule),
  ],
  providers: [
    {
      provide: JOB_RUNNER,
      useClass: BullmqJobRunner,
    },
    BulkUploadRepository,
    AppJobProcessor,
    BulkParserService,
    BulkService,
  ],
  exports: [JOB_RUNNER, BulkUploadRepository, BulkService, BulkParserService],
})
export class BullmqModule {
  constructor() {
    console.log('🔥 BullmqModule loaded');
  }
}
