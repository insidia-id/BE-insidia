import { Injectable } from '@nestjs/common';
import {
  BulkUploadJobStatus,
  BulkUploadRowStatus,
  Prisma,
} from '@prisma/client';
import { BulkService } from 'src/infrastruktur/queue/bullmq/bulk.service';
import type { BulkPermissionDto } from '../dto/create-permission.dto';
import { PermissionsService } from '../permissions.service';
@Injectable()
export class ProcessBulkPermissionImportUseCase {
  constructor(
    private readonly bulkService: BulkService,
    private readonly permissionsService: PermissionsService,
  ) {}

  async execute(jobId: string) {
    await this.bulkService.updateBulkUploadJobStatus(
      jobId,
      BulkUploadJobStatus.PROCESSING,
    );
    const rows = await this.bulkService.findBulkUploadRows(
      jobId,
      BulkUploadRowStatus.VALID,
    );
    let successRows = 0;
    let failedRows = 0;

    for (const row of rows) {
      const rawData = row.rawData as BulkPermissionDto;

      try {
        await this.permissionsService.upsertModulePermission(rawData);

        await this.bulkService.updateBulkUploadRowStatus(
          row.id,
          BulkUploadRowStatus.SUCCESS,
        );

        successRows++;
      } catch (error) {
        const message = this.getImportErrorMessage(error);

        await this.bulkService.updateBulkUploadRowStatus(
          row.id,
          BulkUploadRowStatus.FAILED,
          [message],
        );

        failedRows++;
      }
    }

    await this.bulkService.updateBulkUploadJob(jobId, {
      successRows,
      failedRows,
    });

    return {
      jobId,
      successRows,
      failedRows,
    };
  }

  private getImportErrorMessage(error: unknown) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      return 'Kode permission sudah digunakan';
    }

    if (error instanceof Error) {
      return error.message;
    }

    return 'Unknown error';
  }
}
