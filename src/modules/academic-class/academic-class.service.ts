import { AcademicStatus } from '@prisma/client';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { serializeAcademicClass } from './academic-class.mapper';
import { AcademicClassRepository } from './academic-class.repository';
import { MitraAcademicAccessService } from '../mitra-academic/shared/mitra-academic-access.service';
import type {
  CreateAcademicClassDto,
  UpdateAcademicClassDto,
} from './dto/academic-class.dto';
import {
  buildCreateAcademicClass,
  buildUpdateAcademicClass,
} from './academic-class.mapper';
import { AcademicYearService } from '../academic-year/academic-year.service';
import { CurriculumService } from '../curriculum/curriculum.service';
import { SemesterService } from '../semester/semester.service';
import { AuthenticatedRequest } from 'src/shared/guards/access-token.guard';
import { academicClassPermissionCodes } from './academic-class.constants';
@Injectable()
export class AcademicClassService {
  constructor(
    private readonly repository: AcademicClassRepository,
    private readonly access: MitraAcademicAccessService,
    private readonly academicYearService: AcademicYearService,
    private readonly semesterService: SemesterService,
    private readonly curriculumService: CurriculumService,
  ) {}

  async createAcademicClass(
    mitraId: string,
    dto: CreateAcademicClassDto,
    request: AuthenticatedRequest,
  ) {
    await this.access.ensureActor(
      request.auth.sub,
      mitraId,
      academicClassPermissionCodes.academicClass.create,
    );
    await this.validateClassRelations(mitraId, dto);

    try {
      const created = await this.repository.createAcademicClass(
        buildCreateAcademicClass(mitraId, dto),
      );
      return created;
    } catch (error) {
      this.access.handlePrismaError(error);
    }
  }

  async findAcademicClasses(mitraId: string, request: AuthenticatedRequest) {
    await this.access.ensureActor(
      request.auth.sub,
      mitraId,
      academicClassPermissionCodes.academicClass.view,
    );
    const items = await this.repository.findAcademicClasses(mitraId);
    return items.map((item) => serializeAcademicClass(item));
  }

  async findAcademicClass(
    mitraId: string,
    id: string,
    request: AuthenticatedRequest,
  ) {
    await this.access.ensureActor(
      request.auth.sub,
      mitraId,
      academicClassPermissionCodes.academicClass.view,
    );
    const item = await this.ensureAcademicClass(id, mitraId);
    return serializeAcademicClass(item);
  }

  async updateAcademicClass(
    mitraId: string,
    id: string,
    dto: UpdateAcademicClassDto,
    request: AuthenticatedRequest,
  ) {
    await this.access.ensureActor(
      request.auth.sub,
      mitraId,
      academicClassPermissionCodes.academicClass.update,
    );
    const existing = await this.ensureAcademicClass(id, mitraId);

    await this.validateClassRelations(mitraId, {
      academicYearId: dto.academicYearId ?? existing.academicYearId,
      semesterId: dto.semesterId ?? existing.semesterId,
      curriculumId: dto.curriculumId ?? existing.curriculumId,
    });

    try {
      const updated = await this.repository.updateAcademicClass(
        id,
        buildUpdateAcademicClass(dto, existing),
      );

      return serializeAcademicClass(updated);
    } catch (error) {
      this.access.handlePrismaError(error);
    }
  }

  async removeAcademicClass(
    mitraId: string,
    id: string,
    request: AuthenticatedRequest,
  ) {
    await this.access.ensureActor(
      request.auth.sub,
      mitraId,
      academicClassPermissionCodes.academicClass.remove,
    );
    await this.ensureAcademicClass(id, mitraId);
    await this.repository.updateAcademicClass(id, {
      status: AcademicStatus.INACTIVE,
      deletedAt: new Date(),
    });
    return { message: 'Kelas berhasil dihapus' };
  }

  async ensureAcademicClass(id: string, mitraId: string) {
    const item = await this.repository.findAcademicClassById(id);

    if (!item || item.deletedAt || item.mitraId !== mitraId) {
      throw new NotFoundException('Kelas tidak ditemukan');
    }

    return item;
  }

  async validateClassRelations(
    mitraId: string,
    params: {
      academicYearId: string;
      semesterId: string;
      curriculumId: string;
    },
  ) {
    const [academicYear, semester] = await Promise.all([
      this.academicYearService.ensureAcademicYear(
        params.academicYearId,
        mitraId,
      ),
      this.semesterService.ensureSemester(params.semesterId, mitraId),
      this.curriculumService.ensureCurriculum(params.curriculumId, mitraId),
    ]);

    if (semester.academicYearId !== academicYear.id) {
      throw new ConflictException(
        'Semester harus berada dalam tahun ajaran yang sama',
      );
    }
  }
}
