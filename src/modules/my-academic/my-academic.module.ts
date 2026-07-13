import { Module } from '@nestjs/common';
import { MyAcademicController } from './my-academic.controller';
import { MyAcademicService } from './my-academic.service';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../../infrastruktur/prisma/prisma.module';
import { MyAcademicRepository } from './my-academic.repository';
import { MitraModule } from '../mitra/mitra.module';
import { MitraAcademicModule } from '../mitra-academic/mitra-academic.module';
import { AcademicYearModule } from '../academic-year/acdemic-year.module';
import { SemesterModule } from '../semester/semester.module';
@Module({
  imports: [
    PrismaModule,
    AuthModule,
    MitraModule,
    MitraAcademicModule,
    AcademicYearModule,
    SemesterModule,
  ],
  controllers: [MyAcademicController],
  providers: [MyAcademicService, MyAcademicRepository],
  exports: [MyAcademicService],
})
export class MyAcademicModule {}
