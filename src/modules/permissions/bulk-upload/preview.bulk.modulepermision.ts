import { BadRequestException, Injectable } from '@nestjs/common';
import { RolesPermissionService } from '../../roles/roles.permission';
import type { AuthPayload } from '../../auth/auth.types';
import { permissionCodes } from '../permissions.constants';
import { PermissionsRepository } from '../permissions.repository';
import { BulkParserService } from 'src/infrastruktur/queue/bullmq/bulk-parser';
import {
  UploadedBulkFile,
  ValidationResult,
} from 'src/infrastruktur/queue/bullmq/bulk.types';
import { BulkService } from 'src/infrastruktur/queue/bullmq/bulk.service';
import { BulkPermissionValidatorService } from './bulk.modulepermisson.validator';
import type { BulkPermissionDto } from '../dto/create-permission.dto';

@Injectable()
export class PreviewBulkPermissionUseCase {
  constructor(
    private readonly fileParserService: BulkParserService,
    private readonly validator: BulkPermissionValidatorService,
    private readonly bulkService: BulkService,
    private readonly permissionsRepository: PermissionsRepository,
    private readonly rolesPermissionService: RolesPermissionService,
  ) {}

  async execute(file: UploadedBulkFile, auth: AuthPayload) {
    if (!file) {
      throw new BadRequestException('File wajib diupload');
    }

    const rows = await this.fileParserService.parse<BulkPermissionDto>(file);

    const validatedRows = await this.authorizeRows(
      auth.sub,
      this.validator.validate(rows),
    );

    const checkedRows = await this.applyDatabaseChecks(validatedRows);
    console.log('Checked Rows:', checkedRows);
    const job = await this.bulkService.createBulkUploadJob(
      file.originalname,
      auth.sub,
      checkedRows,
    );

    const summary = this.bulkService.buildPreviewSummary(checkedRows);

    return {
      jobId: job.id,
      ...summary,
    };
  }

  private async authorizeRows(
    actorId: string,
    rows: ValidationResult<BulkPermissionDto>[],
  ) {
    const checkedScopes = new Set<string>();

    return Promise.all(
      rows.map(async (row) => {
        if (!row.parsedData) {
          return row;
        }

        const data = row.parsedData;

        try {
          await this.validateImportAccess(actorId, data, checkedScopes);

          return row;
        } catch (error) {
          return {
            ...row,
            errors: [
              ...row.errors,
              error instanceof Error
                ? error.message
                : 'Anda tidak memiliki akses untuk bulk upload permission',
            ],
          };
        }
      }),
    );
  }

  async validateImportAccess(
    actorId: string,
    data: BulkPermissionDto,
    checkedScopes: Set<string>,
  ) {
    const contextKey = data.scope;

    if (!checkedScopes.has(contextKey)) {
      await this.rolesPermissionService.hasPermission(actorId, {
        permission:
          data.scope === 'MITRA'
            ? permissionCodes.manageMitraPermissions
            : permissionCodes.manageInsidiaPermissions,
        scope: data.scope,
      });

      checkedScopes.add(contextKey);
    }
  }

  private async applyDatabaseChecks(
    rows: ValidationResult<BulkPermissionDto>[],
  ) {
    const parsedRows = rows
      .map((row) => row.parsedData)
      .filter((row): row is BulkPermissionDto => !!row);

    if (parsedRows.length === 0) {
      return rows;
    }

    const permissionCodeValues = [
      ...new Set(parsedRows.map((row) => row.permissionCode.trim())),
    ];
    const moduleNames = [
      ...new Set(parsedRows.map((row) => row.module.trim())),
    ];

    const [existingPermissions, existingModules] = await Promise.all([
      this.permissionsRepository.findPermissionsByCodes(permissionCodeValues),
      this.permissionsRepository.findModulePermissionByModules(moduleNames),
    ]);

    const existingPermissionCodes = new Set(
      existingPermissions.map((permission) => permission.code),
    );
    const existingModulesMap = new Map(
      existingModules.map((module) => [module.module, module]),
    );

    return rows.map((row) => {
      if (!row.parsedData) {
        return row;
      }

      const data = row.parsedData;
      const errors = [...row.errors];
      const warnings = [...(row.warnings ?? [])];
      const code = data.permissionCode.trim();
      const moduleName = data.module.trim();
      const existingModule = existingModulesMap.get(moduleName);

      if (existingPermissionCodes.has(code)) {
        warnings.push('permission code sudah ada, data akan diupdate');
      }

      if (existingModule && existingModule.scope !== data.scope) {
        errors.push('scope module permission tidak sesuai');
      }

      return {
        ...row,
        errors,
        warnings,
      };
    });
  }
}
