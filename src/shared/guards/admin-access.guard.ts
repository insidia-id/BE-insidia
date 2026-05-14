import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  SetMetadata,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { JwtTokenService } from '../../modules/auth/jwt-token.service';
import type { AuthenticatedRequest } from './access-token.guard';
import { getBearerToken } from './access-token.guard';

export const ROLES_KEY = 'roles';

export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly jwtTokenService: JwtTokenService,
    private readonly reflector: Reflector,
  ) {}

  canActivate(context: ExecutionContext) {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles?.length) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    const token = getBearerToken(request as Request);

    if (!token) {
      throw new UnauthorizedException('Access token wajib dikirim');
    }

    const auth = this.jwtTokenService.verifyAccessToken(token);

    if (!requiredRoles.includes(auth.role)) {
      throw new ForbiddenException('Akses tidak diizinkan');
    }

    request.auth = auth;

    return true;
  }
}
