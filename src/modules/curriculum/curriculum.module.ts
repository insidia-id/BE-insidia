import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastruktur/prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { MitraAcademicModule } from '../mitra-academic/mitra-academic.module';
import { CurriculumService } from './curriculum.service';
import { CurriculumRepository } from './curriculum.repository';
import { CurriculumController } from './curriculum.controller';
@Module({
  imports: [PrismaModule, AuthModule, MitraAcademicModule],
  controllers: [CurriculumController],
  providers: [CurriculumService, CurriculumRepository],
  exports: [CurriculumService, CurriculumRepository],
})
export class CurriculumModule {}
