import { Controller, Get, Param, Query, Req, UseGuards } from '@nestjs/common';
import {
  AccessTokenGuard,
  type AuthenticatedRequest,
} from '../../../shared/guards/access-token.guard';
import { ZodValidationPipe } from '../../../shared/zod/zod-validation.pipe';
import {
  learningMaterialListQuerySchema,
  type LearningMaterialListQueryDto,
} from '../learning-material/learning-material.dto';
import { MyAcademicService } from './my-academic.service';

@UseGuards(AccessTokenGuard)
@Controller('mitras/:mitraId/academic')
export class MyAcademicController {
  constructor(private readonly service: MyAcademicService) {}

  @Get('kelas-saya')
  findMyClasses(
    @Param('mitraId') mitraId: string,
    @Query(new ZodValidationPipe(learningMaterialListQuerySchema))
    query: LearningMaterialListQueryDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.service.findMyClasses(mitraId, request.auth, query);
  }

  @Get('mapel-saya')
  findMySubjects(
    @Param('mitraId') mitraId: string,
    @Query(new ZodValidationPipe(learningMaterialListQuerySchema))
    query: LearningMaterialListQueryDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.service.findMySubjects(mitraId, request.auth, query);
  }

  @Get('materi-saya')
  findMyLearningMaterials(
    @Param('mitraId') mitraId: string,
    @Query(new ZodValidationPipe(learningMaterialListQuerySchema))
    query: LearningMaterialListQueryDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.service.findMyLearningMaterials(mitraId, request.auth, query);
  }
}
