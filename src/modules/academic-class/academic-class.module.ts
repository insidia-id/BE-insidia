import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastruktur/prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { MitraAcademicModule } from '../mitra-academic/mitra-academic.module';
import { AcademicYearModule } from '../academic-year/acdemic-year.module';
import { SemesterModule } from '../semester/semester.module';
import { CurriculumModule } from '../curriculum/curriculum.module';
import { AcademicClassController } from './academic-class.controller';
import { AcademicClassService } from './academic-class.service';
import { AcademicClassRepository } from './academic-class.repository';
@Module({
  imports: [
    PrismaModule,
    AuthModule,
    MitraAcademicModule,
    AcademicYearModule,
    SemesterModule,
    CurriculumModule,
  ],
  controllers: [AcademicClassController],
  providers: [AcademicClassService, AcademicClassRepository],
  exports: [AcademicClassService, AcademicClassRepository],
})
export class AcademicClassModule {}
