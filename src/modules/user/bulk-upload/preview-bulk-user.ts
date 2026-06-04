import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import type { AuthPayload } from '../../auth/auth.types';
import { RolesPermissionService } from '../../roles/roles.permission';
import { BulkUserValidatorService } from './bulk-user-validator';
import type { CreateUserDto } from '../dto/create-user.dto';
import { UserPolicy } from '../user.Policy';
import { UserRepository } from '../user.repository';
import { userPermisionsCode } from '../user.constants';
import { BulkParserService } from 'src/infrastruktur/queue/bullmq/bulk-parser';
import {
  UploadedBulkFile,
  ValidationResult,
} from 'src/infrastruktur/queue/bullmq/bulk.types';
import { BulkService } from 'src/infrastruktur/queue/bullmq/bulk.service';
@Injectable()
export class PreviewBulkUserUseCase {
  constructor(
    private readonly fileParserService: BulkParserService,
    private readonly validator: BulkUserValidatorService,
    private readonly bulkService: BulkService,
    private readonly userRepository: UserRepository,
    private readonly rolesPermissionService: RolesPermissionService,
    private readonly userPolicy: UserPolicy,
  ) {}

  async execute(file: UploadedBulkFile, auth: AuthPayload) {
    if (!file) {
      throw new BadRequestException('File wajib diupload');
    }

    const actor = await this.userRepository.findRoleByUserId(auth.sub);

    if (!actor) {
      throw new NotFoundException('User tidak ditemukan');
    }

    const rows = await this.fileParserService.parse<CreateUserDto>(file);

    const preparedRows = rows.map((row) => this.applyActorDefaults(row, actor));
    const validatedRows = await this.authorizeRows(
      auth.sub,
      actor,
      this.validator.validate(preparedRows),
    );

    const job = await this.bulkService.createBulkUploadJob(
      file.originalname,
      auth.sub,
      validatedRows,
    );

    const summary = this.bulkService.buildPreviewSummary(validatedRows);

    return {
      jobId: job.id,
      ...summary,
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
    rows: ValidationResult<CreateUserDto>[],
  ) {
    const checkedContexts = new Set<string>();

    return Promise.all(
      rows.map(async (row) => {
        if (!row.parsedData) {
          return row;
        }

        const data = row.parsedData;

        try {
          await this.validateImportAccess(
            actorId,
            actor,
            data,
            checkedContexts,
          );

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

  async validateImportAccess(
    actorId: string,
    actor: NonNullable<Awaited<ReturnType<UserRepository['findRoleByUserId']>>>,

    data: CreateUserDto,
    checkedContexts: Set<string>,
  ) {
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
        data.scope === 'MITRA' ? (data.mitraRole ?? null) : (data.role ?? null),
      targetScope: data.scope,
    });

    if (data.scope === 'MITRA' && data.mitraId) {
      this.userPolicy.canManageMitraUser(data.mitraId, actor);
    }
  }
}
