import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import type { AuthPayload } from '../../auth/auth.types';
import { RolesPermissionService } from '../../roles/roles.permission';
import { BulkUserParserService } from './bulk-user-parser';
import {
  BulkUserValidatorService,
  ValidationResult,
} from './bulk-user-validator';
import { BulkUploadRepository } from '../../../infrastruktur/queue/bullmq/bulk-upload.repository';
import type { CreateUserDto } from '../dto/create-user.dto';
import { UserPolicy } from '../user.Policy';
import { UserRepository } from '../user.repository';
import { userPermisionsCode } from '../user.constants';
import { UploadedBulkUserFile } from './bulk-user.types';

@Injectable()
export class PreviewBulkUserUseCase {
  constructor(
    private readonly parser: BulkUserParserService,
    private readonly validator: BulkUserValidatorService,
    private readonly repository: BulkUploadRepository,
    private readonly userRepository: UserRepository,
    private readonly rolesPermissionService: RolesPermissionService,
    private readonly userPolicy: UserPolicy,
  ) {}

  async execute(file: UploadedBulkUserFile, auth: AuthPayload) {
    if (!file) {
      throw new BadRequestException('File wajib diupload');
    }

    const actor = await this.userRepository.findRoleByUserId(auth.sub);

    if (!actor) {
      throw new NotFoundException('User tidak ditemukan');
    }

    const rows = await this.parser.parse(file);
    const preparedRows = rows.map((row) => this.applyActorDefaults(row, actor));
    const validatedRows = await this.authorizeRows(
      auth.sub,
      actor,
      this.validator.validate(preparedRows),
    );

    const validRows = validatedRows.filter((row) => row.errors.length === 0).length;

    const invalidRows = validatedRows.length - validRows;

    const job = await this.repository.createBulkUploadJob({
      fileName: file.originalname,
      uploadedBy: auth.sub,

      totalRows: validatedRows.length,

      validRows,
      invalidRows,

      rows: validatedRows.map((row) => ({
        rowNumber: row.rowNumber,
        rawData: row.parsedData ?? row.rawData,
        errors: row.errors,
      })),
    });

    return {
      jobId: job.id,
      totalRows: job.totalRows,
      validRows: job.validRows,
      invalidRows: job.invalidRows,
      canImport: job.invalidRows === 0,
    };
  }

  private applyActorDefaults(
    row: CreateUserDto,
    actor: NonNullable<Awaited<ReturnType<UserRepository['findRoleByUserId']>>>,
  ): CreateUserDto {
    if (
      actor.mitraRoles?.role.code !== 'AKADEMIK' ||
      !actor.mitraRoles.mitraId
    ) {
      return row;
    }

    return {
      ...row,
      scope: 'MITRA',
      mitraId: actor.mitraRoles.mitraId,
    };
  }

  private async authorizeRows(
    actorId: string,
    actor: NonNullable<Awaited<ReturnType<UserRepository['findRoleByUserId']>>>,
    rows: ValidationResult[],
  ) {
    const checkedContexts = new Set<string>();

    return Promise.all(
      rows.map(async (row) => {
        if (!row.parsedData) {
          return row;
        }

        const data = row.parsedData;

        try {
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
            targetRoleCode: this.getTargetRoleCode(data),
            targetScope: data.scope,
          });

          if (data.scope === 'MITRA' && data.mitraId) {
            this.userPolicy.canManageMitraUser(
              actor.mitraRoles?.mitraId ?? data.mitraId,
              data.mitraId,
              actor,
            );
          }

          return row;
        } catch (error) {
          return {
            ...row,
            errors: [
              ...row.errors,
              error instanceof Error
                ? error.message
                : 'Anda tidak memiliki akses untuk bulk upload user ini',
            ],
          };
        }
      }),
    );
  }

  private getTargetRoleCode(data: CreateUserDto) {
    return data.scope === 'MITRA' ? data.mitraRole ?? null : data.role ?? null;
  }
}
