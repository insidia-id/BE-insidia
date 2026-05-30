// src/modules/users/use-cases/process-bulk-user-import.usecase.ts

import { Injectable } from '@nestjs/common';
import {
  BulkUploadJobStatus,
  BulkUploadRowStatus,
} from '@prisma/client';
import { BulkUploadRepository } from '../../../infrastruktur/queue/bullmq/bulk-upload.repository';
import { UserRepository } from '../user.repository';
import { CreateUserDto } from '../dto/create-user.dto';

@Injectable()
export class ProcessBulkUserImportUseCase {
  constructor(
    private readonly BulkUploadRepository: BulkUploadRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async execute(jobId: string) {
    await this.BulkUploadRepository.updateBulkUploadJobStatus(
      jobId,
      BulkUploadJobStatus.PROCESSING,
    );

    const rows = await this.BulkUploadRepository.findBulkUploadRows(
      jobId,
      BulkUploadRowStatus.VALID,
    );

    let successRows = 0;
    let failedRows = 0;

    for (const row of rows) {
      const rawData = row.rawData as CreateUserDto;

      try {
        await this.userRepository.upsertBulkUser(rawData);

        await this.BulkUploadRepository.updateBulkUploadRowStatus(
          row.id,
          BulkUploadRowStatus.SUCCESS,
        );

        successRows++;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Unknown error';

        await this.BulkUploadRepository.updateBulkUploadRowStatus(
          row.id,
          BulkUploadRowStatus.FAILED,
          [message],
        );

        failedRows++;
      }
    }

    await this.BulkUploadRepository.updateBulkUploadJob(jobId, {
      successRows,
      failedRows,
    });

    return {
      jobId,
      successRows,
      failedRows,
    };
  }
}
