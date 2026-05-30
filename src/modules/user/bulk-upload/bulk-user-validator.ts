import { Injectable } from '@nestjs/common';
import { createUserSchema } from '../dto/create-user.dto';
import { CreateUserDto } from '../dto/create-user.dto';
import { normalizeEmail } from '../user.mapper';

export type ValidationResult = {
  rowNumber: number;
  rawData: CreateUserDto;
  parsedData?: CreateUserDto;
  errors: string[];
};

@Injectable()
export class BulkUserValidatorService {
  validate(rows: CreateUserDto[]): ValidationResult[] {
    const seenEmails = new Set<string>();

    return rows.map((row, index) => {
      const result = createUserSchema.safeParse(row);

      const errors: string[] = [];

      if (!result.success) {
        errors.push(...result.error.issues.map((issue) => issue.message));
      }

      if (result.success) {
        const email = normalizeEmail(result.data.email);

        if (seenEmails.has(email)) {
          errors.push('email duplicate di file');
        }

        seenEmails.add(email);
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
