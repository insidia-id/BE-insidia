import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { BulkUploadRowStatus } from '@prisma/client';
import type { AuthPayload } from '../../auth/auth.types';
import { UserBulkImportJob } from '../jobs/user-bulk-import.job';
import type { CreateUserDto } from '../dto/create-user.dto';
import { UserRepository } from '../user.repository';
import { PreviewBulkUserUseCase } from './preview-bulk-user';
import { BulkService } from 'src/infrastruktur/queue/bullmq/bulk.service';
@Injectable()
export class EnqueueBulkUserImportUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly PreviewBulkUserUseCase: PreviewBulkUserUseCase,
    private readonly bulkService: BulkService,
  ) {}

  async execute(jobId: string, auth: AuthPayload) {
    const job = await this.bulkService.findBulkUploadJob(jobId);

    const actor = await this.userRepository.findRoleByUserId(auth.sub);

    if (!actor) {
      throw new NotFoundException('User tidak ditemukan');
    }

    this.bulkService.validateJobOwnership(job, actor, auth.sub);

    this.bulkService.validateJobReadyForImport(job);

    const rows = await this.bulkService.findBulkUploadRows(
      jobId,
      BulkUploadRowStatus.VALID,
    );

    await this.ensureActorCanImportRows(auth.sub, actor, rows);

    await this.bulkService.queueJob(
      jobId,
      UserBulkImportJob.type,
      UserBulkImportJob.createPayload(jobId),
    );

    return {
      jobId,
      status: 'QUEUED',
    };
  }

  private async ensureActorCanImportRows(
    actorId: string,
    actor: NonNullable<Awaited<ReturnType<UserRepository['findRoleByUserId']>>>,
    rows: Array<{ rawData: unknown }>,
  ) {
    const checkedContexts = new Set<string>();

    for (const row of rows) {
      const data = row.rawData as CreateUserDto;
      await this.PreviewBulkUserUseCase.validateImportAccess(
        actorId,
        actor,
        data,
        checkedContexts,
      );
    }
  }
}
