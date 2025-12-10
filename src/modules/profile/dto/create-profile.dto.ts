import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsDateString, IsEnum, IsNumber, IsOptional } from 'class-validator';
import { UserEntity } from 'src/modules/users/entities/user.entity';

import { EnumProfileGender, IProfile } from '../entities/profile.entity';

export class CreateProfileDto implements IProfile {
  user: UserEntity;

  @ApiProperty({
    description: 'Optional avatar URL of the user profile',
    example: 'https://example.com/avatar.jpg',
    required: false,
  })
  @IsOptional()
  avatar?: string;

  @ApiProperty({
    description: 'Optional biography text of the user profile',
    example: 'Software developer with 10 years of experience.',
    required: false,
  })
  @IsOptional()
  bio?: string;

  @ApiProperty({
    description: 'Gender of the user profile',
    example: EnumProfileGender.FEMALE,
    enum: EnumProfileGender,
    enumName: 'EnumProfileGender',
    required: false,
  })
  @IsOptional()
  @IsEnum(EnumProfileGender)
  @Transform(({ value }: { value: string }) =>
    value ? value.toUpperCase() : value,
  )
  gender?: EnumProfileGender;

  @ApiProperty({
    description: "User's date of birth",
    example: '2001-05-15',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  bornAt?: Date;

  @ApiProperty({
    description: 'Body height of the user in centimeters',
    example: 170,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  bodyHeight?: number;

  @ApiProperty({
    description: 'Body weight of the user in kilograms',
    example: 65,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  bodyWeight?: number;
}
