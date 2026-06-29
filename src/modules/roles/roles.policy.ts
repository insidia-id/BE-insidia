import { ForbiddenException, Injectable } from '@nestjs/common';
import { actorRole } from './roles.types';

@Injectable()
export class rolesPolicy {
  constructor() {}
  canManageMitra(targetMitraId: string, actorRole?: actorRole) {
    if (actorRole?.insidiaRole?.role.code === 'SUPER_ADMIN') {
      return true;
    }

    if (actorRole?.insidiaRole?.role.code === 'ADMIN') {
      return true;
    }
    if (actorRole?.mitraRoles?.find((r) => r.mitraId === targetMitraId)) {
      return true;
    }
    throw new ForbiddenException('Tidak memiliki izin mengelola user mitra');
  }
}
