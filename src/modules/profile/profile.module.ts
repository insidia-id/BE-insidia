import { Module } from '@nestjs/common';

import { ProfileService } from './profile.service';
import { PrismaModule } from '../../infrastruktur/prisma/prisma.module';
import { ProfileRepository } from './profile.repository';

@Module({
  imports: [PrismaModule],
  providers: [ProfileService, ProfileRepository],
  exports: [ProfileService, ProfileRepository],
})
export class ProfileModule {}
