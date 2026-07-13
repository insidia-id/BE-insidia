import { Module } from '@nestjs/common';
import { CourseModulesModule } from '../course-modules/course-modules.module';
import { LearningItemsController } from './learning-items.controller';
import { LearningItemsRepository } from './learning-items.repository';
import { LearningItemsService } from './learning-items.service';
import { PrismaModule } from '../../infrastruktur/prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { CourseModule } from '../course/course.module';
@Module({
  imports: [CourseModulesModule, PrismaModule, AuthModule, CourseModule],
  controllers: [LearningItemsController],
  providers: [LearningItemsRepository, LearningItemsService],
  exports: [LearningItemsRepository, LearningItemsService],
})
export class LearningItemsModule {}
