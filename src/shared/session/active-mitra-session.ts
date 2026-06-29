import { ForbiddenException } from '@nestjs/common';
import type { AuthenticatedRequest } from '../guards/access-token.guard';

export function requireActiveMitraId(
  request: AuthenticatedRequest,
  paramMitraId?: string,
) {
  const activeMitraId = request.session?.activeMitraId ?? paramMitraId;

  if (!activeMitraId) {
    throw new ForbiddenException('Mitra aktif belum dipilih');
  }

  return activeMitraId;
}
