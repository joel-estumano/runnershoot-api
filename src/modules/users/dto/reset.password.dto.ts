import { IsStringValid } from '@common/decorators/is-string.decorator';
import { ApiProperty, PickType } from '@nestjs/swagger';

import { CreateUserDto } from './create-user.dto';

export class ResetPasswordDto extends PickType(CreateUserDto, [
  'email',
  'password',
] as const) {
  @ApiProperty({
    description: 'Token de redefinição de senha gerado pelo sistema',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...', // exemplo de JWT
  })
  @IsStringValid()
  token: string;
}
