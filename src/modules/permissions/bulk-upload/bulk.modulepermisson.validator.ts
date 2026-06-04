import { Injectable } from '@nestjs/common';
import {
  bulkPermissionSchema,
  BulkPermissionDto,
} from '../dto/create-permission.dto';
import type { ValidationResult } from 'src/infrastruktur/queue/bullmq/bulk.types';
@Injectable()
export class BulkPermissionValidatorService {
  validate(rows: BulkPermissionDto[]): ValidationResult<BulkPermissionDto>[] {
    const seenPermissionCodes = new Set<string>();

    return rows.map((row, index) => {
      const result = bulkPermissionSchema.safeParse(row);

      const errors: string[] = [];

      if (!result.success) {
        errors.push(...result.error.issues.map((issue) => issue.message));
      }

      if (result.success) {
        const code = result.data.permissionCode.toUpperCase();

        if (seenPermissionCodes.has(code)) {
          errors.push('permission code duplicate di file');
        }

        seenPermissionCodes.add(code);
      }

      return {
        rowNumber: index + 2,
        rawData: row,
        parsedData: result.success ? result.data : undefined,
        errors,
      };
    });
  }
}
