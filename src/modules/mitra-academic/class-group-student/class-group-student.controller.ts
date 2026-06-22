import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  AccessTokenGuard,
  type AuthenticatedRequest,
} from '../../../shared/guards/access-token.guard';
import { requireActiveMitraId } from '../../../shared/session/active-mitra-session';
import { ZodValidationPipe } from '../../../shared/zod/zod-validation.pipe';
import {
  classGroupStudentListQuerySchema,
  createClassGroupStudentSchema,
  type ClassGroupStudentListQueryDto,
  type CreateClassGroupStudentDto,
  updateClassGroupStudentSchema,
  type UpdateClassGroupStudentDto,
} from './class-group-student.dto';
import { ClassGroupStudentService } from './class-group-student.service';

@UseGuards(AccessTokenGuard)
@Controller('mitras/active/academic/rombel-murid')
export class ClassGroupStudentController {
  constructor(private readonly service: ClassGroupStudentService) {}

  @Post()
  createClassGroupStudent(
    @Body(new ZodValidationPipe(createClassGroupStudentSchema))
    dto: CreateClassGroupStudentDto,
    @Req() request: AuthenticatedRequest,
  ) {
    const mitraId = requireActiveMitraId(request);
    return this.service.createClassGroupStudent(mitraId, dto, request.auth);
  }

  @Get()
  findClassGroupStudents(
    @Query(new ZodValidationPipe(classGroupStudentListQuerySchema))
    query: ClassGroupStudentListQueryDto,
    @Req() request: AuthenticatedRequest,
  ) {
    const mitraId = requireActiveMitraId(request);
    return this.service.findClassGroupStudents(mitraId, request.auth, query);
  }

  @Get(':id')
  findClassGroupStudent(
    @Param('id') id: string,
    @Req() request: AuthenticatedRequest,
  ) {
    const mitraId = requireActiveMitraId(request);
    return this.service.findClassGroupStudent(mitraId, id, request.auth);
  }

  @Patch(':id')
  updateClassGroupStudent(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateClassGroupStudentSchema))
    dto: UpdateClassGroupStudentDto,
    @Req() request: AuthenticatedRequest,
  ) {
    const mitraId = requireActiveMitraId(request);
    return this.service.updateClassGroupStudent(mitraId, id, dto, request.auth);
  }

  @Delete(':id')
  removeClassGroupStudent(
    @Param('id') id: string,
    @Req() request: AuthenticatedRequest,
  ) {
    const mitraId = requireActiveMitraId(request);
    return this.service.removeClassGroupStudent(mitraId, id, request.auth);
  }
}
