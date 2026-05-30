import { Injectable } from '@nestjs/common';
import type { AuthPayload } from '../auth/auth.types';
import { CoursePolicy } from '../course/course.policy';
import { actorRole } from '../user/user.types';

type CourseModuleTarget = {
  course: {
    creatorId: string;
  };
};

@Injectable()
export class CourseModulesPolicy {
  constructor(private readonly coursePolicy: CoursePolicy) {}
  canManage(actor: actorRole, target: CourseModuleTarget) {
    return this.coursePolicy.canManage(actor, {
      creatorId: target.course.creatorId,
    });
  }
}
