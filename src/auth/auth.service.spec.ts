import { Test, TestingModule } from '@nestjs/testing';
import { OtpService } from '../otp/otp.service';
import { AuthRepository } from './auth.repository';
import { AuthService } from './auth.service';
import { JwtTokenService } from './jwt-token.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: AuthRepository,
          useValue: {},
        },
        {
          provide: JwtTokenService,
          useValue: {},
        },
        {
          provide: OtpService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
