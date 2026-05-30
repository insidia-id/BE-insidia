import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastruktur/prisma/prisma.module';
import { AccessTokenGuard } from '../../shared/guards/access-token.guard';
import { AuthModule } from '../auth/auth.module';
import { JwtTokenService } from '../auth/jwt-token.service';
import { MitraAcademicModule } from '../mitra-academic/mitra-academic.module';
import { RolesModule } from '../roles/roles.module';
import { CourseController } from './course.controller';
import { CoursePolicy } from './course.policy';
import { CourseRepository } from './course.repository';
import { CourseService } from './course.service';

@Module({
  imports: [PrismaModule, RolesModule, AuthModule, MitraAcademicModule],
  controllers: [CourseController],
  providers: [
    CourseService,
    CourseRepository,
    CoursePolicy,
    JwtTokenService,
    AccessTokenGuard,
  ],
  exports: [CourseService, CourseRepository, CoursePolicy],
})
export class CourseModule {}
