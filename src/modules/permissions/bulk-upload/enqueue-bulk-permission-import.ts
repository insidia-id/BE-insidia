import { Injectable, NotFoundException } from '@nestjs/common';
import { BulkUploadRowStatus } from '@prisma/client';
import type { AuthPayload } from '../../auth/auth.types';
import { PermissionBulkImportJob } from '../jobs/permission-bulk-import.job';
import { PermissionsRepository } from '../permissions.repository';
import { PreviewBulkPermissionUseCase } from './preview.bulk.modulepermision';
import { BulkService } from 'src/infrastruktur/queue/bullmq/bulk.service';
import type { BulkPermissionDto } from '../dto/create-permission.dto';

@Injectable()
export class EnqueueBulkPermissionImportUseCase {
  constructor(
    private readonly permissionsRepository: PermissionsRepository,
    private readonly previewBulkPermissionUseCase: PreviewBulkPermissionUseCase,
    private readonly bulkService: BulkService,
  ) {}

  async execute(jobId: string, auth: AuthPayload) {
    const job = await this.bulkService.findBulkUploadJob(jobId);

    const actor = await this.permissionsRepository.findActorByUserId(auth.sub);

    if (!actor) {
      throw new NotFoundException('User tidak ditemukan');
    }

    this.bulkService.validateJobOwnership(job, actor, auth.sub);

    this.bulkService.validateJobReadyForImport(job);

    const rows = await this.bulkService.findBulkUploadRows(
      jobId,
      BulkUploadRowStatus.VALID,
    );

    await this.ensureActorCanImportRows(auth.sub, rows);

    await this.bulkService.queueJob(
      jobId,
      PermissionBulkImportJob.type,
      PermissionBulkImportJob.createPayload(jobId),
    );
    return {
      jobId,
      status: 'QUEUED',
    };
  }

  private async ensureActorCanImportRows(
    actorId: string,
    rows: Array<{ rawData: unknown }>,
  ) {
    const checkedScopes = new Set<string>();

    for (const row of rows) {
      const data = row.rawData as BulkPermissionDto;
      await this.previewBulkPermissionUseCase.validateImportAccess(
        actorId,
        data,
        checkedScopes,
      );
    }
  }
}
