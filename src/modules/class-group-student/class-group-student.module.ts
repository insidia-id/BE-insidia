import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastruktur/prisma/prisma.module';
import { MitraAcademicModule } from '../mitra-academic/mitra-academic.module';
import { ClassGroupModule } from '../class-group/class-group.module';
import { ClassGroupStudentController } from './class-group-student.controller';
import { ClassGroupStudentService } from './class-group-student.service';
import { ClassGroupStudentRepository } from './class-group-students.repository';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, MitraAcademicModule, ClassGroupModule, AuthModule],
  controllers: [ClassGroupStudentController],
  providers: [ClassGroupStudentService, ClassGroupStudentRepository],
  exports: [ClassGroupStudentService, ClassGroupStudentRepository],
})
export class ClassGroupStudentModule {}
