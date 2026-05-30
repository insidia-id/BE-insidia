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
@Controller('mitras/:mitraId/academic/rombel-murid')
export class ClassGroupStudentController {
  constructor(private readonly service: ClassGroupStudentService) {}

  @Post()
  createClassGroupStudent(
    @Param('mitraId') mitraId: string,
    @Body(new ZodValidationPipe(createClassGroupStudentSchema))
    dto: CreateClassGroupStudentDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.service.createClassGroupStudent(mitraId, dto, request.auth);
  }

  @Get()
  findClassGroupStudents(
    @Param('mitraId') mitraId: string,
    @Query(new ZodValidationPipe(classGroupStudentListQuerySchema))
    query: ClassGroupStudentListQueryDto,
    @Req() request: AuthenticatedRequest,
  ) {
    console.log('Finding class group students with data:', {
      mitraId,
      query,
      userId: request.auth.sub,
    });
    return this.service.findClassGroupStudents(mitraId, request.auth, query);
  }

  @Get(':id')
  findClassGroupStudent(
    @Param('mitraId') mitraId: string,
    @Param('id') id: string,
    @Req() request: AuthenticatedRequest,
  ) {
    console.log('Finding class group student with data:', {
      mitraId,
      id,
      userId: request.auth.sub,
    });
    return this.service.findClassGroupStudent(mitraId, id, request.auth);
  }

  @Patch(':id')
  updateClassGroupStudent(
    @Param('mitraId') mitraId: string,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateClassGroupStudentSchema))
    dto: UpdateClassGroupStudentDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.service.updateClassGroupStudent(mitraId, id, dto, request.auth);
  }

  @Delete(':id')
  removeClassGroupStudent(
    @Param('mitraId') mitraId: string,
    @Param('id') id: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.service.removeClassGroupStudent(mitraId, id, request.auth);
  }
}
