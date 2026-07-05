import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

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
import { AuthenticatedRequest } from 'src/shared/guards/access-token.guard';
import { mapPreviewBulkUploadUserData } from '../user.mapper';
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

  async execute(file: UploadedBulkFile, request: AuthenticatedRequest) {
    if (!file) {
      throw new BadRequestException('File wajib diupload');
    }
    const activeMitraId = request.session.activeMitraId;
    const actor = await this.userRepository.findRoleByUserId(request.auth.sub);

    if (!actor) {
      throw new NotFoundException('User tidak ditemukan');
    }

    const rows = await this.fileParserService.parse<CreateUserDto>(file);

    const preparedRows = rows.map((row) =>
      this.applyActorDefaults(row, activeMitraId ?? undefined),
    );
    const validatedRows = await this.authorizeRows(
      request.auth.sub,
      actor,
      this.validator.validate(preparedRows),
      activeMitraId ?? undefined,
    );

    const job = await this.bulkService.createBulkUploadJob(
      file.originalname,
      request.auth.sub,
      validatedRows,
    );

    const summary = this.bulkService.buildPreviewSummary(validatedRows);

    return {
      jobId: job.id,
      ...summary,
    };
  }

  private applyActorDefaults(row: any, activeMitraId?: string): CreateUserDto {
    if (!activeMitraId) {
      return row;
    }
    const PreviewData = mapPreviewBulkUploadUserData(row, activeMitraId);

    return PreviewData;
  }

  private async authorizeRows(
    actorId: string,
    actor: NonNullable<Awaited<ReturnType<UserRepository['findRoleByUserId']>>>,
    rows: ValidationResult<CreateUserDto>[],
    activeMitraId?: string,
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
            activeMitraId,
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
    activeMitraId?: string,
  ) {
    const primaryAssignment = data.mitraRoles?.[0];

    const contextKey =
      data.scope === 'MITRA'
        ? `${data.scope}:${primaryAssignment?.mitraId ?? ''}`
        : data.scope;

    if (!checkedContexts.has(contextKey)) {
      await this.rolesPermissionService.hasPermission(actorId, {
        permission:
          data.scope === 'MITRA'
            ? userPermisionsCode.createMitraUser
            : userPermisionsCode.createInsidiaUser,
        scope: data.scope,
        mitraId:
          data.scope === 'MITRA' ? primaryAssignment?.mitraId : undefined,
        requireMitraContext: data.scope === 'MITRA',
      });

      checkedContexts.add(contextKey);
    }

    this.userPolicy.canCreate(
      actor,
      {
        targetRoleCode:
          data.scope === 'MITRA'
            ? (primaryAssignment?.roleCode ?? null)
            : (data.role ?? null),
        targetScope: data.scope,
      },
      activeMitraId ?? undefined,
    );

    if (data.scope === 'MITRA' && primaryAssignment?.mitraId) {
      this.userPolicy.canManageMitraUser(primaryAssignment.mitraId, actor);
    }
  }
}
