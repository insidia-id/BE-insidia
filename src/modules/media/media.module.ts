import { Module } from '@nestjs/common';
import { R2Module } from '../../infrastruktur/r2/r2.module';
import { PrismaModule } from '../../infrastruktur/prisma/prisma.module';
import { AccessTokenGuard } from '../../shared/guards/access-token.guard';
import { AuthModule } from '../auth/auth.module';
import { JwtTokenService } from '../auth/jwt-token.service';
import { CourseModulesModule } from '../course-modules/course-modules.module';
import { CourseModule } from '../course/course.module';
import { RolesModule } from '../roles/roles.module';
import { MediaController } from './media.controller';
import { MediaPolicy } from './media.policy';
import { MediaRepository } from './media.repository';
import { MediaService } from './media.service';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    CourseModule,
    CourseModulesModule,
    RolesModule,
    R2Module,
  ],
  controllers: [MediaController],
  providers: [
    MediaService,
    MediaRepository,
    MediaPolicy,
    JwtTokenService,
    AccessTokenGuard,
  ],
  exports: [MediaService, MediaRepository, MediaPolicy],
})
export class MediaModule {}
