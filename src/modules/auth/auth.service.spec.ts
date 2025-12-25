import { TokenService } from '@common/modules/token/token.service';
import { UsersService } from '@modules/users/users.service';
import { Test, TestingModule } from '@nestjs/testing';

import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  let tokenService: TokenService;
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: TokenService,
          useValue: {
            sign: jest.fn().mockReturnValue('fake-token'),
            verify: jest.fn().mockReturnValue(true),
          },
        },
        {
          provide: UsersService,
          useValue: {
            findByEmail: jest
              .fn()
              .mockResolvedValue({ id: 1, email: 'test@test.com' }),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    //
    tokenService = module.get<TokenService>(TokenService);
    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    //
    expect(tokenService).toBeDefined();
    expect(usersService).toBeDefined();
  });
});
