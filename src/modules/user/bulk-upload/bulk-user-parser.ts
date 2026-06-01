import { Injectable, BadRequestException } from '@nestjs/common';
import { Readable } from 'stream';
import csv from 'csv-parser';
import * as XLSX from 'xlsx';

import { CreateUserDto } from '../dto/create-user.dto';
import { UploadedBulkUserFile } from './bulk-user.types';

@Injectable()
export class BulkUserParserService {
  async parse(file: UploadedBulkUserFile): Promise<CreateUserDto[]> {
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

  private parseCsv(buffer: Buffer): Promise<CreateUserDto[]> {
    return new Promise((resolve, reject) => {
      const rows: CreateUserDto[] = [];

      Readable.from(buffer)
        .pipe(csv())
        .on('data', (row) => {
          rows.push(row as CreateUserDto);
        })
        .on('end', () => {
          resolve(rows);
        })
        .on('error', reject);
    });
  }

  private parseExcel(buffer: Buffer): CreateUserDto[] {
    const workbook = XLSX.read(buffer, {
      type: 'buffer',
    });

    const firstSheet = workbook.SheetNames[0];

    if (!firstSheet) {
      throw new BadRequestException('Sheet Excel tidak ditemukan');
    }

    const worksheet = workbook.Sheets[firstSheet];

    return XLSX.utils.sheet_to_json<CreateUserDto>(worksheet, {
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
