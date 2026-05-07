import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtTokenService } from '../auth/jwt-token.service';
import type { AccessTokenPayload } from '../auth/jwt-token.service';

export type AuthenticatedRequest = Request & {
  auth: AccessTokenPayload;
};

@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(private readonly jwtTokenService: JwtTokenService) {}

  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = getBearerToken(request);
    if (process.env.NODE_ENV === 'staging') {
      console.log('AccessTokenGuard: Extracted token:', token);
    }
    if (!token) {
      throw new UnauthorizedException('Access token wajib dikirim');
    }

    request.auth = this.jwtTokenService.verifyAccessToken(token);

    return true;
  }
}

export function getBearerToken(request: Request) {
  const authorization = request.headers.authorization;

  if (!authorization?.startsWith('Bearer ')) {
    return null;
  }

  return authorization.slice('Bearer '.length).trim();
}
