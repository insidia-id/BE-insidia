import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastruktur/prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { MitraAcademicModule } from '../mitra-academic/mitra-academic.module';
import { AcademicYearModule } from '../academic-year/acdemic-year.module';
import { SemesterController } from './semester.controller';
import { SemesterRepository } from './semester.repository';
import { SemesterService } from './semester.service';

@Module({
  imports: [PrismaModule, AuthModule, MitraAcademicModule, AcademicYearModule],
  controllers: [SemesterController],
  providers: [SemesterService, SemesterRepository],
  exports: [SemesterService, SemesterRepository],
})
export class SemesterModule {}
