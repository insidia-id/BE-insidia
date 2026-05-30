import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastruktur/prisma/prisma.module';
import { AccessTokenGuard } from '../../shared/guards/access-token.guard';
import { AuthModule } from '../auth/auth.module';
import { JwtTokenService } from '../auth/jwt-token.service';
import { CourseModule } from '../course/course.module';
import { CourseModulesController } from './course-modules.controller';
import { CourseModulesPolicy } from './course-modules.policy';
import { CourseModulesRepository } from './course-modules.repository';
import { CourseModulesService } from './course-modules.service';
import { RolesModule } from '../roles/roles.module';

@Module({
  imports: [PrismaModule, AuthModule, CourseModule, RolesModule],
  controllers: [CourseModulesController],
  providers: [
    CourseModulesService,
    CourseModulesRepository,
    CourseModulesPolicy,
    JwtTokenService,
    AccessTokenGuard,
  ],
  exports: [CourseModulesService, CourseModulesRepository, CourseModulesPolicy],
})
export class CourseModulesModule {}
