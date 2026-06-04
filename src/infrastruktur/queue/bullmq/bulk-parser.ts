import { Injectable, BadRequestException } from '@nestjs/common';
import { Readable } from 'stream';
import csv from 'csv-parser';
import * as XLSX from 'xlsx';

import { UploadedBulkFile } from './bulk.types';

@Injectable()
export class BulkParserService {
  async parse<T>(file: UploadedBulkFile): Promise<T[]> {
    if (!file?.buffer) {
      throw new BadRequestException('File tidak ditemukan');
    }

    const mimeType = file.mimetype;

    if (this.isCsv(mimeType)) {
      return this.parseCsv(file.buffer);
    }

    if (this.isExcel(mimeType)) {
      return this.parseExcel(file.buffer);
    }

    throw new BadRequestException(
      'Format file tidak didukung. Gunakan CSV atau Excel',
    );
  }

  private parseCsv<T>(buffer: Buffer): Promise<T[]> {
    return new Promise((resolve, reject) => {
      const rows: T[] = [];

      Readable.from(buffer)
        .pipe(csv())
        .on('data', (row) => {
          rows.push(row as T);
        })
        .on('end', () => {
          resolve(rows);
        })
        .on('error', reject);
    });
  }

  private parseExcel<T>(buffer: Buffer): T[] {
    const workbook = XLSX.read(buffer, {
      type: 'buffer',
    });

    const firstSheet = workbook.SheetNames[0];

    if (!firstSheet) {
      throw new BadRequestException('Sheet Excel tidak ditemukan');
    }

    const worksheet = workbook.Sheets[firstSheet];

    return XLSX.utils.sheet_to_json<T>(worksheet, {
      defval: '',
    });
  }

  private isCsv(mimetype: string): boolean {
    return ['text/csv', 'application/csv', 'text/plain'].includes(mimetype);
  }

  private isExcel(mimetype: string): boolean {
    return [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
    ].includes(mimetype);
  }
}
