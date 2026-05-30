import { ForbiddenException } from '@nestjs/common';
import {
  getInsidiaPermissionCodes,
  getInsidiaRoleCode,
  getMitraPermissionCodes,
  getMitraRoles,
} from '../access-control/access-control.utils';
import type { ProfileUser, SessionUser } from './auth.repository.types';
import type { AuthUserResponse } from './auth.types';

export function resolveAccessProfile(user: SessionUser) {
  const role = getInsidiaRoleCode(user);

  if (!role) {
    throw new ForbiddenException('User belum memiliki role Insidia');
  }

  return {
    role,
    permissions: getInsidiaPermissionCodes(user),
  };
}

export function serializeAuthUser(user: SessionUser): AuthUserResponse {
  const accessProfile = resolveAccessProfile(user);

  return {
    id: user.id,
    email: user.email,
    emailVerified: user.emailVerified,
    name: user.name,
    status: user.status,
    image: user.image,
    role: accessProfile.role,
    permissions: accessProfile.permissions,
  };
}
export function serializeProfileUser(user: ProfileUser) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    status: user.status,
    image: user.image,
    insidiaRole: getInsidiaRoleCode(user),
    mitraRoles: getMitraRoles(user),
    permissions: [
      ...(getInsidiaPermissionCodes(user) ?? []),
      ...(getMitraPermissionCodes(user) ?? []),
    ],
  };
}
export type ProfileResponse = ReturnType<typeof serializeProfileUser>;
