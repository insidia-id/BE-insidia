import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastruktur/prisma/prisma.module';
import { AccessTokenGuard } from '../../shared/guards/access-token.guard';
import { AuthModule } from '../auth/auth.module';
import { JwtTokenService } from '../auth/jwt-token.service';
import { CourseModulesController } from './course-modules.controller';
import { CourseModulesRepository } from './course-modules.repository';
import { CourseModulesService } from './course-modules.service';
import { ClassGroupCourseModule } from '../class-group-course/class-group-course.module';
import { ClassGroupModule } from '../class-group/class-group.module';
import { CourseModule } from '../course/course.module';
@Module({
  imports: [
    PrismaModule,
    AuthModule,
    ClassGroupCourseModule,
    ClassGroupModule,
    CourseModule,
  ],
  controllers: [CourseModulesController],
  providers: [
    CourseModulesService,
    CourseModulesRepository,
    JwtTokenService,
    AccessTokenGuard,
  ],
  exports: [CourseModulesService, CourseModulesRepository],
})
export class CourseModulesModule {}
