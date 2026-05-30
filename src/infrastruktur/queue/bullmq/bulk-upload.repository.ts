import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { BulkUploadJobStatus, BulkUploadRowStatus } from '@prisma/client';

@Injectable()
export class BulkUploadRepository {
  constructor(private readonly prisma: PrismaService) {}
  findBulkUploadJobById(jobId: string) {
    return this.prisma.bulkUploadJob.findUnique({
      where: { id: jobId },
    });
  }
  updateBulkUploadJobStatus(jobId: string, status: BulkUploadJobStatus) {
    return this.prisma.bulkUploadJob.update({
      where: { id: jobId },
      data: {
        status,
      },
    });
  }
  findBulkUploadRows(jobId: string, status: BulkUploadRowStatus) {
    return this.prisma.bulkUploadRow.findMany({
      where: {
        jobId,
        status,
      },
      orderBy: {
        rowNumber: 'asc',
      },
    });
  }
  updateBulkUploadRowStatus(
    rowId: string,
    status: BulkUploadRowStatus,
    errors?: string[],
  ) {
    return this.prisma.bulkUploadRow.update({
      where: { id: rowId },
      data: {
        status,
        errors: errors ?? Prisma.JsonNull,
      },
    });
  }
  updateBulkUploadJob(
    jobId: string,
    data: { successRows?: number; failedRows?: number },
  ) {
    const failedRows = data.failedRows ?? 0;

    return this.prisma.bulkUploadJob.update({
      where: { id: jobId },
      data: {
        ...data,
        status:
          failedRows > 0
            ? BulkUploadJobStatus.FAILED
            : BulkUploadJobStatus.COMPLETED,
      },
    });
  }
  createBulkUploadJob(params: {
    fileName: string;
    uploadedBy: string;
    totalRows: number;
    validRows: number;
    invalidRows: number;
    rows: {
      rowNumber: number;
      rawData: any;
      errors: string[];
    }[];
  }) {
    return this.prisma.bulkUploadJob.create({
      data: {
        fileName: params.fileName,
        uploadedBy: params.uploadedBy,
        status: BulkUploadJobStatus.VALIDATED,

        totalRows: params.totalRows,
        validRows: params.validRows,
        invalidRows: params.invalidRows,

        rows: {
          createMany: {
            data: params.rows.map((row) => ({
              rowNumber: row.rowNumber,
              rawData: row.rawData,
              errors: row.errors.length > 0 ? row.errors : Prisma.JsonNull,
              status: row.errors.length
                ? BulkUploadRowStatus.INVALID
                : BulkUploadRowStatus.VALID,
            })),
          },
        },
      },
    });
  }
}
