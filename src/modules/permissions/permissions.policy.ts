import { ForbiddenException, Injectable } from '@nestjs/common';
import type { actorRole } from '../user/user.types';
import { RoleScope } from '@prisma/client';
@Injectable()
export class PermissionsPolicy {
  constructor() {}
}
