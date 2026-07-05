import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastruktur/prisma/prisma.module';
import { MitraAcademicModule } from '../mitra-academic/mitra-academic.module';
import { CourseModule } from '../course/course.module';
import { ClassGroupCourseRepository } from './class-group-course.repository';
import { ClassGroupCourseService } from './class-group-course.service';
import { ClassGroupCourseController } from './class-group-course.controller';
import { ClassGroupModule } from '../class-group/class-group.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    PrismaModule,
    MitraAcademicModule,
    CourseModule,
    ClassGroupModule,
    AuthModule,
  ],
  controllers: [ClassGroupCourseController],
  providers: [ClassGroupCourseService, ClassGroupCourseRepository],
  exports: [ClassGroupCourseService, ClassGroupCourseRepository],
})
export class ClassGroupCourseModule {}
