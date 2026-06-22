import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import {
  AccessTokenGuard,
  type AuthenticatedRequest,
} from '../../../shared/guards/access-token.guard';
import { requireActiveMitraId } from '../../../shared/session/active-mitra-session';
import { ZodValidationPipe } from '../../../shared/zod/zod-validation.pipe';
import {
  learningMaterialListQuerySchema,
  type LearningMaterialListQueryDto,
} from '../learning-material/learning-material.dto';
import { MyAcademicService } from './my-academic.service';

@UseGuards(AccessTokenGuard)
@Controller('mitras/active/academic')
export class MyAcademicController {
  constructor(private readonly service: MyAcademicService) {}

  @Get('kelas-saya')
  findMyClasses(
    @Query(new ZodValidationPipe(learningMaterialListQuerySchema))
    query: LearningMaterialListQueryDto,
    @Req() request: AuthenticatedRequest,
  ) {
    const mitraId = requireActiveMitraId(request);
    return this.service.findMyClasses(mitraId, request.auth, query);
  }

  @Get('mapel-saya')
  findMySubjects(
    @Query(new ZodValidationPipe(learningMaterialListQuerySchema))
    query: LearningMaterialListQueryDto,
    @Req() request: AuthenticatedRequest,
  ) {
    const mitraId = requireActiveMitraId(request);
    return this.service.findMySubjects(mitraId, request.auth, query);
  }

  @Get('materi-saya')
  findMyLearningMaterials(
    @Query(new ZodValidationPipe(learningMaterialListQuerySchema))
    query: LearningMaterialListQueryDto,
    @Req() request: AuthenticatedRequest,
  ) {
    const mitraId = requireActiveMitraId(request);
    return this.service.findMyLearningMaterials(mitraId, request.auth, query);
  }
}
