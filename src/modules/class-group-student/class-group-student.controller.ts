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
} from '../../shared/guards/access-token.guard';
import { requireActiveMitraId } from '../../shared/session/active-mitra-session';
import { ZodValidationPipe } from '../../shared/zod/zod-validation.pipe';
import {
  classGroupStudentListQuerySchema,
  createClassGroupStudentSchema,
  type ClassGroupStudentListQueryDto,
  type CreateClassGroupStudentDto,
  updateClassGroupStudentSchema,
  type UpdateClassGroupStudentDto,
} from './dto/class-group-student.dto';
import { ClassGroupStudentService } from './class-group-student.service';

@UseGuards(AccessTokenGuard)
@Controller('mitras')
export class ClassGroupStudentController {
  constructor(private readonly service: ClassGroupStudentService) {}

  @Post(':mitraId/class-group-students')
  createClassGroupStudent(
    @Param('mitraId') mitraId: string,
    @Body(new ZodValidationPipe(createClassGroupStudentSchema))
    dto: CreateClassGroupStudentDto,
    @Req() request: AuthenticatedRequest,
  ) {
    const activeMitraId = requireActiveMitraId(request, mitraId);
    return this.service.createClassGroupStudent(activeMitraId, dto, request);
  }

  @Get(':mitraId/class-group-students')
  findClassGroupStudents(
    @Param('mitraId') mitraId: string,
    @Query(new ZodValidationPipe(classGroupStudentListQuerySchema))
    query: ClassGroupStudentListQueryDto,
    @Req() request: AuthenticatedRequest,
  ) {
    const activeMitraId = requireActiveMitraId(request, mitraId);
    return this.service.findClassGroupStudents(activeMitraId, request, query);
  }

  @Get(':mitraId/class-group-students/:id')
  findClassGroupStudent(
    @Param('id') id: string,
    @Param('mitraId') mitraId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    const activeMitraId = requireActiveMitraId(request, mitraId);
    return this.service.findClassGroupStudent(activeMitraId, id, request);
  }

  @Patch(':mitraId/class-group-students/:id')
  updateClassGroupStudent(
    @Param('id') id: string,
    @Param('mitraId') mitraId: string,
    @Body(new ZodValidationPipe(updateClassGroupStudentSchema))
    dto: UpdateClassGroupStudentDto,
    @Req() request: AuthenticatedRequest,
  ) {
    const activeMitraId = requireActiveMitraId(request, mitraId);
    return this.service.updateClassGroupStudent(
      activeMitraId,
      id,
      dto,
      request,
    );
  }

  @Delete(':mitraId/class-group-students/:id')
  removeClassGroupStudent(
    @Param('id') id: string,
    @Param('mitraId') mitraId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    const activeMitraId = requireActiveMitraId(request, mitraId);
    return this.service.removeClassGroupStudent(activeMitraId, id, request);
  }
}
