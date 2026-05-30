import { Injectable } from '@nestjs/common';
import { Readable } from 'stream';
import csv from 'csv-parser';
import { CreateUserDto } from '../dto/create-user.dto';
import { UploadedBulkUserFile } from './bulk-user.types';

@Injectable()
export class BulkUserParserService {
  async parse(file: UploadedBulkUserFile): Promise<CreateUserDto[]> {
    const rows: CreateUserDto[] = [];

    return new Promise((resolve, reject) => {
      Readable.from(file.buffer)
        .pipe(csv())
        .on('data', (row) => rows.push(row as CreateUserDto))
        .on('end', () => resolve(rows))
        .on('error', reject);
    });
  }
}
