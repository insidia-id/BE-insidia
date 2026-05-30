// src/modules/users/use-cases/enqueue-bulk-user-import.usecase.ts

import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BulkUploadJobStatus, BulkUploadRowStatus } from '@prisma/client';
import type { AuthPayload } from '../../auth/auth.types';
import { JOB_RUNNER, type JobRunner } from '../../../shared/jobs/job-contract';
import { UserBulkImportJob } from '../jobs/user-bulk-import.job';
import { BulkUploadRepository } from '../../../infrastruktur/queue/bullmq/bulk-upload.repository';
import type { CreateUserDto } from '../dto/create-user.dto';
import { RolesPermissionService } from '../../roles/roles.permission';
import { userPermisionsCode } from '../user.constants';
import { UserPolicy } from '../user.Policy';
import { UserRepository } from '../user.repository';
@Injectable()
export class EnqueueBulkUserImportUseCase {
  constructor(
    @Inject(JOB_RUNNER)
    private readonly jobRunner: JobRunner,
    private readonly bulkUploadRepository: BulkUploadRepository,
    private readonly userRepository: UserRepository,
    private readonly rolesPermissionService: RolesPermissionService,
    private readonly userPolicy: UserPolicy,
  ) {}

  async execute(jobId: string, auth: AuthPayload) {
    const job = await this.bulkUploadRepository.findBulkUploadJobById(jobId);

    if (!job) {
      throw new NotFoundException('Bulk upload job tidak ditemukan');
    }

    const actor = await this.userRepository.findRoleByUserId(auth.sub);

    if (!actor) {
      throw new NotFoundException('User tidak ditemukan');
    }

    const isPrivilegedActor = ['SUPER_ADMIN', 'ADMIN'].includes(
      actor.insidiaRole?.role.code ?? '',
    );

    if (job.uploadedBy && job.uploadedBy !== auth.sub && !isPrivilegedActor) {
      throw new ForbiddenException(
        'Job bulk upload hanya bisa di-import oleh pengunggahnya',
      );
    }

    if (job.status !== BulkUploadJobStatus.VALIDATED) {
      throw new BadRequestException('Job tidak bisa di-import');
    }

    if (job.invalidRows > 0) {
      throw new BadRequestException(
        'Masih ada invalid row. Perbaiki file lalu preview ulang.',
      );
    }

    const rows = await this.bulkUploadRepository.findBulkUploadRows(
      jobId,
      BulkUploadRowStatus.VALID,
    );

    await this.ensureActorCanImportRows(auth.sub, actor, rows);

    await this.bulkUploadRepository.updateBulkUploadJobStatus(
      jobId,
      BulkUploadJobStatus.QUEUED,
    );

    await this.jobRunner.dispatch(
      UserBulkImportJob.type,
      UserBulkImportJob.createPayload(jobId),
      {
        jobId,
        attempts: 3,
      },
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
      const contextKey = `${data.scope}:${data.mitraId ?? ''}`;

      if (!checkedContexts.has(contextKey)) {
        await this.rolesPermissionService.hasPermission(actorId, {
          permission:
            data.scope === 'MITRA'
              ? userPermisionsCode.createMitraUser
              : userPermisionsCode.createInsidiaUser,
          scope: data.scope,
          mitraId: data.scope === 'MITRA' ? data.mitraId : undefined,
          requireMitraContext: data.scope === 'MITRA',
        });
        checkedContexts.add(contextKey);
      }

      this.userPolicy.canCreate(actor, {
        targetRoleCode:
          data.scope === 'MITRA' ? data.mitraRole ?? null : data.role ?? null,
        targetScope: data.scope,
      });

      if (data.scope === 'MITRA' && data.mitraId) {
        this.userPolicy.canManageMitraUser(
          actor.mitraRoles?.mitraId ?? data.mitraId,
          data.mitraId,
          actor,
        );
      }
    }
  }
}
