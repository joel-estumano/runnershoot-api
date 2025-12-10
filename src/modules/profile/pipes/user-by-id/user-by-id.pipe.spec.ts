import {
  ArgumentMetadata,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from 'src/modules/users/users.service';

import { UserByIdPipe } from './user-by-id.pipe';

describe('UserByIdPipe', () => {
  let usersService: Partial<UsersService>;
  let pipe: UserByIdPipe;

  beforeEach(() => {
    usersService = {
      findById: jest.fn(),
    };
    pipe = new UserByIdPipe(usersService as UsersService);
  });

  it('should be defined', () => {
    expect(pipe).toBeDefined();
  });

  it('should throw BadRequestException if value is empty', async () => {
    await expect(
      pipe.transform('', { data: 'id' } as ArgumentMetadata),
    ).rejects.toThrow(BadRequestException);
  });

  it('should throw BadRequestException if value is not an integer', async () => {
    await expect(
      pipe.transform('abc', { data: 'id' } as ArgumentMetadata),
    ).rejects.toThrow(BadRequestException);
  });

  it('should throw NotFoundException if user is not found', async () => {
    (usersService.findById as jest.Mock).mockResolvedValue(null);

    await expect(
      pipe.transform('1', { data: 'id' } as ArgumentMetadata),
    ).rejects.toThrow(NotFoundException);
  });
});
