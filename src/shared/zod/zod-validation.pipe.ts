import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import type { ZodTypeAny } from 'zod';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private readonly schema: ZodTypeAny) {}

  transform(value: unknown) {
    console.log('===== ZOD VALIDATION VALUE =====');
    console.dir(value, { depth: null });
    console.log(`value`, value);

    const result = this.schema.safeParse(value);
    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        path: issue.path.join('.'),
        code: issue.code,
        message: issue.message,
        issue,
      }));
      console.log('===== ZOD VALIDATION ERRORS =====');
      console.dir(errors, { depth: null });

      console.log('===== ZOD ERROR FORMAT =====');
      console.dir(result.error.format(), { depth: null });
      throw new BadRequestException({
        message: 'Validasi gagal',
        errors: result.error.issues.map((issue) => ({
          path: issue.path.join('.'),
          message: issue.message,
        })),
      });
    }

    return result.data;
  }
}
