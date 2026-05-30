import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { CourseModulesModule } from './modules/course-modules/course-modules.module';
import { CourseModule } from './modules/course/course.module';
import { MediaModule } from './modules/media/media.module';
import { MitraAcademicModule } from './modules/mitra-academic/mitra-academic.module';
import { MitraModule } from './modules/mitra/mitra.module';
import { PermissionsModule } from './modules/permissions/permissions.module';
import { RolesModule } from './modules/roles/roles.module';
import { UserModule } from './modules/user/user.module';

@Module({
  imports: [
    AuthModule,
    UserModule,
    RolesModule,
    PermissionsModule,
    MitraModule,
    MitraAcademicModule,
    CourseModule,
    CourseModulesModule,
    MediaModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
