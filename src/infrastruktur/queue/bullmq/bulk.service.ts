import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Inject,
  NotFoundException,
} from '@nestjs/common';
import { ValidationResult } from './bulk.types';
import { BulkUploadRepository } from './bulk-upload.repository';
import { actorRole } from 'src/modules/user/user.types';
import { BulkUploadJobStatus, BulkUploadRowStatus } from '@prisma/client';
import { JOB_RUNNER, type JobRunner } from '../../../shared/jobs/job-contract';
import { JobType } from 'src/shared/jobs/jobs.types';
@Injectable()
export class BulkService {
  constructor(
    @Inject(JOB_RUNNER)
    private readonly jobRunner: JobRunner,
    private readonly bulkRepository: BulkUploadRepository,
  ) {}

  buildPreviewSummary<T extends Record<string, unknown>>(
    rows: ValidationResult<T>[],
  ) {
    const validRows = rows.filter((row) => row.errors.length === 0).length;
    const warningsRows = rows
      .filter((row) => (row.warnings ?? []).length > 0)
      .map((row) => ({
        rowNumber: row.rowNumber,
        warnings: row.warnings ?? [],
      }));
    const invalidRows = rows.length - validRows;

    const failedRows = rows
      .filter((row) => row.errors.length > 0)
      .map((row) => ({
        rowNumber: row.rowNumber,
        errors: row.errors,
      }));

    return {
      totalRows: rows.length,
      validRows,
      invalidRows,
      canImport: invalidRows === 0,
      failedRows,
      warningsRows,
    };
  }

  buildJobRows<T extends Record<string, unknown>>(rows: ValidationResult<T>[]) {
    return rows.map((row) => ({
      rowNumber: row.rowNumber,
      rawData: row.parsedData ?? row.rawData,
      errors: row.errors,
    }));
  }

  async createBulkUploadJob<T extends Record<string, unknown>>(
    fileName: string,
    uploadedBy: string,
    rows: ValidationResult<T>[],
  ) {
    const summary = this.buildPreviewSummary(rows);

    return this.bulkRepository.createBulkUploadJob({
      fileName,
      uploadedBy,

      totalRows: summary.totalRows,
      validRows: summary.validRows,
      invalidRows: summary.invalidRows,

      rows: this.buildJobRows(rows),
    });
  }

  async findBulkUploadJob(jobId: string) {
    const job = await this.bulkRepository.findBulkUploadJobById(jobId);
    if (!job) {
      throw new NotFoundException('Bulk upload job tidak ditemukan');
    }
    return job;
  }

  async findBulkUploadRows(jobId: string, status: BulkUploadRowStatus) {
    return this.bulkRepository.findBulkUploadRows(jobId, status);
  }

  async updateBulkUploadJobStatus(jobId: string, status: BulkUploadJobStatus) {
    await this.bulkRepository.updateBulkUploadJobStatus(jobId, status);
  }

  async updateBulkUploadRowStatus(
    rowId: string,
    status: BulkUploadRowStatus,
    errors: string[] = [],
  ) {
    await this.bulkRepository.updateBulkUploadRowStatus(rowId, status, errors);
  }

  async updateBulkUploadJob(
    jobId: string,
    data: { successRows?: number; failedRows?: number },
  ) {
    await this.bulkRepository.updateBulkUploadJob(jobId, data);
  }

  validateJobOwnership(
    job: NonNullable<
      Awaited<ReturnType<BulkUploadRepository['findBulkUploadJobById']>>
    >,
    actor: actorRole,
    actorId: string,
  ) {
    const isPrivilegedActor = ['SUPER_ADMIN', 'ADMIN'].includes(
      actor.insidiaRole?.role.code ?? '',
    );

    if (job.uploadedBy && job.uploadedBy !== actorId && !isPrivilegedActor) {
      throw new ForbiddenException(
        'Job bulk upload hanya bisa diproses oleh pengunggahnya',
      );
    }
  }

  validateJobReadyForImport(
    job: NonNullable<
      Awaited<ReturnType<BulkUploadRepository['findBulkUploadJobById']>>
    >,
  ) {
    if (job.status !== BulkUploadJobStatus.VALIDATED) {
      throw new BadRequestException('Job tidak bisa di-import');
    }

    if (job.invalidRows > 0) {
      throw new BadRequestException('Masih ada invalid row');
    }
  }

  async queueJob(jobId: string, type: JobType, payload: { jobId: string }) {
    await this.updateBulkUploadJobStatus(jobId, BulkUploadJobStatus.QUEUED);

    const dispatchResult = await this.jobRunner.dispatch(type, payload, {
      jobId,
      attempts: 3,
    });
    console.log(
      `Dispatched job ${jobId} of type ${type} with result:`,
      dispatchResult,
    );
  }
}
