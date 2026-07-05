import { Module } from '@nestjs/common';
import { CourseModulesModule } from '../course-modules/course-modules.module';
import { UserModule } from '../user/user.module';
import { LearningItemsController } from './learning-items.controller';
import { LearningItemsRepository } from './learning-items.repository';
import { LearningItemsService } from './learning-items.service';
import { LearningItemsPolicy } from './learning-items.policy';
import { PrismaModule } from '../../infrastruktur/prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
@Module({
  imports: [CourseModulesModule, UserModule, PrismaModule, AuthModule],
  controllers: [LearningItemsController],
  providers: [
    LearningItemsRepository,
    LearningItemsService,
    LearningItemsPolicy,
  ],
  exports: [LearningItemsRepository, LearningItemsService],
})
export class LearningItemsModule {}
