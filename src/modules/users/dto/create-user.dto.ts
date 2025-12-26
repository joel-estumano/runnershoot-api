import { IsStringValid } from '@common/decorators/is-string.decorator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  Matches,
  MinLength,
} from 'class-validator';

import { IUser } from '../entities/user.entity';

export class CreateUserDto implements IUser {
  @ApiProperty({
    description: 'First name must be a non-empty string',
    example: 'Jane',
  })
  @IsStringValid()
  firstName: string;

  @ApiProperty({
    description: 'Last name must be a non-empty string',
    example: 'Doe',
  })
  @IsStringValid()
  lastName: string;

  @ApiProperty({
    description: 'Valid and unique user email address',
    example: 'jane.doe@email.com',
  })
  @IsStringValid()
  @IsEmail()
  email: string;

  @ApiProperty({
    description:
      'Password must be at least 6 characters long, including letters and numbers',
    example: 'abc123',
  })
  @IsStringValid()
  @MinLength(6, { message: 'the password must be at least 6 characters long' })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/, {
    message: 'the password must contain letters and numbers',
  })
  password: string;

  @ApiProperty({
    description: 'Tenant ID (numeric, from MySQL AUTO_INCREMENT)',
    example: 1,
  })
  @IsInt()
  @Type(() => Number)
  @IsNotEmpty()
  tenantId: number;
}
