import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../../infrastruktur/prisma/prisma.module';
import { LearningItemsModule } from '../learning-items/learning-items.module';
import { LessonsController } from './lessons.controller';
import { LessonsRepository } from './lessons.repository';
import { LessonsService } from './lessons.service';
import { LessonsPolicy } from './lessons.policy';

@Module({
  imports: [PrismaModule, AuthModule, LearningItemsModule],
  controllers: [LessonsController],
  providers: [LessonsRepository, LessonsService, LessonsPolicy],
  exports: [LessonsRepository, LessonsService],
})
export class LessonsModule {}
