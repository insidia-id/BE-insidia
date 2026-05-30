import { ForbiddenException, Injectable } from '@nestjs/common';
import type { AuthPayload } from '../auth/auth.types';
import { CoursePolicy } from '../course/course.policy';
import type { actorRole } from '../user/user.types';

type MediaTarget = {
  course: {
    creatorId: string;
  } | null;
  module: {
    course: {
      creatorId: string;
    };
  } | null;
};

@Injectable()
export class MediaPolicy {
  constructor(private readonly coursePolicy: CoursePolicy) {}

  canManage(actor: actorRole, target: MediaTarget, auth?: AuthPayload) {
    const creatorId =
      target.course?.creatorId ?? target.module?.course.creatorId;

    if (!creatorId) {
      throw new ForbiddenException(
        'Media tidak terhubung ke course yang valid',
      );
    }

    return this.coursePolicy.canManage(actor, {
      creatorId,
    }, auth);
  }
}
