import { Controller, Get, Query, Req, UseGuards, Param } from '@nestjs/common';
import {
  AccessTokenGuard,
  type AuthenticatedRequest,
} from '../../shared/guards/access-token.guard';
import { requireActiveMitraId } from '../../shared/session/active-mitra-session';
import { ZodValidationPipe } from '../../shared/zod/zod-validation.pipe';
import {
  MyAcademicQuery,
  type MyAcademicQueryDto,
} from './dto/my-academic.dto';
import { MyAcademicService } from './my-academic.service';
@UseGuards(AccessTokenGuard)
@Controller('mitras')
export class MyAcademicController {
  constructor(private readonly service: MyAcademicService) {}

  @Get('my-classes')
  findMyClasses(
    @Query(new ZodValidationPipe(MyAcademicQuery))
    query: MyAcademicQueryDto,
    @Req() request: AuthenticatedRequest,
  ) {
    const mitraId = requireActiveMitraId(request);
    return this.service.findMyClasses(mitraId, request, query);
  }

  @Get('my-courses')
  findMyCourses(
    @Query(new ZodValidationPipe(MyAcademicQuery))
    query: MyAcademicQueryDto,
    @Req() request: AuthenticatedRequest,
  ) {
    const mitraId = requireActiveMitraId(request);
    return this.service.findMySubjects(mitraId, request, query);
  }

  @Get('my-courses/:id')
  findMyCourseById(
    @Param('id') id: string,
    @Req() request: AuthenticatedRequest,
  ) {
    const mitraId = requireActiveMitraId(request);
    return this.service.findMyCourseById(mitraId, request, id);
  }
}
