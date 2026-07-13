import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import {
  AccessTokenGuard,
  type AuthenticatedRequest,
} from '../../shared/guards/access-token.guard';

import { LearningItemsService } from './learning-items.service';

@UseGuards(AccessTokenGuard)
@Controller('admin')
export class LearningItemsController {
  constructor(private readonly learningItemsService: LearningItemsService) {}

  @Get('modules/:moduleId/learning-items')
  findByModuleId(
    @Param('moduleId') moduleId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.learningItemsService.findByModuleId(moduleId, request);
  }
}
