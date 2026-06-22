import { ForbiddenException } from '@nestjs/common';
import type { AuthenticatedRequest } from '../guards/access-token.guard';

export function requireActiveMitraId(request: AuthenticatedRequest) {
  const activeMitraId = request.session?.activeMitraId;

  if (!activeMitraId) {
    throw new ForbiddenException('Mitra aktif belum dipilih');
  }

  return activeMitraId;
}
