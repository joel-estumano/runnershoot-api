import { IsStringValid } from '@common/decorators/is-string.decorator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsIn, IsOptional, Matches, MinLength } from 'class-validator';

import { EnumUserRole, IUser } from '../entities/user.entity';

export class CreateUserDto implements IUser {
  @ApiProperty({
    description: 'Role of the user',
    example: EnumUserRole.USER,
    enum: [EnumUserRole.USER, EnumUserRole.ORGANIZER],
    enumName: 'EnumUserRole',
    required: false,
  })
  @IsOptional()
  @IsIn([EnumUserRole.USER, EnumUserRole.ORGANIZER])
  @Transform(({ value }: { value: string }) =>
    value ? value.toUpperCase() : value,
  )
  role: EnumUserRole;

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
}
