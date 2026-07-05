import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastruktur/prisma/prisma.module';
import { AcademicYearController } from './academic-year.controller';
import { AcademicYearService } from './academic-year.service';
import { AcademicYearRepository } from './academic-year.repository';
import { AuthModule } from '../auth/auth.module';
import { MitraAcademicModule } from '../mitra-academic/mitra-academic.module';

@Module({
  imports: [PrismaModule, AuthModule, MitraAcademicModule],
  controllers: [AcademicYearController],
  providers: [AcademicYearService, AcademicYearRepository],
  exports: [AcademicYearService, AcademicYearRepository],
})
export class AcademicYearModule {}
