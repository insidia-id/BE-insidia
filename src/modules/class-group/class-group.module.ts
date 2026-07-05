import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastruktur/prisma/prisma.module';
import { ClassGroupController } from './class-group.controller';
import { ClassGroupService } from './class-group.service';
import { AcademicClassModule } from '../academic-class/academic-class.module';
import { MitraAcademicModule } from '../mitra-academic/mitra-academic.module';
import { AcademicClassRepository } from './class-group.repository';
import { AuthModule } from '../auth/auth.module';
@Module({
  imports: [PrismaModule, AcademicClassModule, MitraAcademicModule, AuthModule],
  controllers: [ClassGroupController],
  providers: [ClassGroupService, AcademicClassRepository],
  exports: [ClassGroupService, AcademicClassRepository],
})
export class ClassGroupModule {}
