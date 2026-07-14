import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { CourseModulesModule } from './modules/course-modules/course-modules.module';
import { CourseModule } from './modules/course/course.module';
import { LearningItemsModule } from './modules/learning-items/learning-items.module';
import { LessonsModule } from './modules/lessons/lessons.module';
import { MediaModule } from './modules/media/media.module';
import { MitraAcademicModule } from './modules/mitra-academic/mitra-academic.module';
import { MitraModule } from './modules/mitra/mitra.module';
import { PermissionsModule } from './modules/permissions/permissions.module';
import { RolesModule } from './modules/roles/roles.module';
import { UserModule } from './modules/user/user.module';
import { QueueModule } from './infrastruktur/queue/queue.module';
import { RedisModule } from './infrastruktur/redis/redis.module';
import { AcademicClassModule } from './modules/academic-class/academic-class.module';
import { AcademicYearModule } from './modules/academic-year/acdemic-year.module';
import { SemesterModule } from './modules/semester/semester.module';
import { CurriculumModule } from './modules/curriculum/curriculum.module';
import { ClassGroupModule } from './modules/class-group/class-group.module';
import { ClassGroupCourseModule } from './modules/class-group-course/class-group-course.module';
import { ClassGroupStudentModule } from './modules/class-group-student/class-group-student.module';
import { MyAcademicModule } from './modules/my-academic/my-academic.module';
import { ConfigModule } from '@nestjs/config';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      ignoreEnvFile: process.env.NODE_ENV === 'production',
    }),
    AuthModule,
    UserModule,
    RolesModule,
    QueueModule,
    PermissionsModule,
    MitraModule,
    MitraAcademicModule,
    CourseModule,
    CourseModulesModule,
    LearningItemsModule,
    LessonsModule,
    MediaModule,
    RedisModule,
    AcademicYearModule,
    SemesterModule,
    CurriculumModule,
    AcademicClassModule,
    ClassGroupModule,
    ClassGroupCourseModule,
    ClassGroupStudentModule,
    MyAcademicModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
