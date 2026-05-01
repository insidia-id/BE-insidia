import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import type { Request } from 'express';
import { createHash, timingSafeEqual } from 'crypto';
import { getBearerToken } from './access-token.guard';
@Injectable()
export class InternalTokenGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>();
    const configuredToken = process.env.AUTH_INTERNAL_TOKEN;

    if (!configuredToken) {
      throw new InternalServerErrorException(
        'Token internal belum dikonfigurasi',
      );
    }

    const incomingToken =
      getHeader(request, 'x-internal-token') ?? getBearerToken(request);

    if (!incomingToken || !safeTokenEqual(incomingToken, configuredToken)) {
      throw new ForbiddenException('Token internal tidak valid');
    }

    return true;
  }
}

function getHeader(request: Request, name: string) {
  const value = request.headers[name];

  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

function safeTokenEqual(left: string, right: string) {
  const leftHash = createHash('sha256').update(left).digest();
  const rightHash = createHash('sha256').update(right).digest();

  return timingSafeEqual(leftHash, rightHash);
}
