import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import type { AccessTokenPayload } from '../../modules/auth/auth.types';
import { JwtTokenService } from '../../modules/auth/jwt-token.service';
import { AuthService } from 'src/modules/auth/auth.service';

export type AuthenticatedRequest = Request & {
  auth: AccessTokenPayload;
};

@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(
    private readonly jwtTokenService: JwtTokenService,
    private readonly authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    const token = getBearerToken(request);

    if (!token) {
      throw new UnauthorizedException('Access token wajib dikirim');
    }

    const auth = this.jwtTokenService.verifyAccessToken(token);

    const user = await this.authService.getSessionStatus(auth);

    if (!user) {
      throw new UnauthorizedException({
        code: 'USER_NOT_FOUND',
        message: 'User tidak ditemukan',
      });
    }

    if (user.status === 'BANNED') {
      throw new ForbiddenException({
        code: 'USER_BANNED',
        message: 'Akun kamu telah diblokir',
      });
    }

    request.auth = auth;
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
