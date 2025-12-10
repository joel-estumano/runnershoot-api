import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

import { EnumUserRole, IUser } from '../entities/user.entity';

export class OutputUserDto implements IUser {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty({
    description: 'First name must be a non-empty string',
    example: 'Jane',
  })
  @Expose()
  firstName: string;

  @ApiProperty({
    description: 'Last name must be a non-empty string',
    example: 'Doe',
  })
  @Expose()
  lastName: string;

  @ApiProperty({
    description: 'Valid and unique user email address',
    example: 'jane.doe@email.com',
  })
  @Expose()
  email: string;

  @Exclude()
  password: string;

  @ApiProperty()
  @Expose()
  role: EnumUserRole;
}
