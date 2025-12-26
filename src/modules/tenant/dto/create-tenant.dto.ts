import { IsStringValid } from '@common/decorators/is-string.decorator';
import { ApiProperty } from '@nestjs/swagger';
import { MaxLength } from 'class-validator';

export class CreateTenantDto {
  @ApiProperty({
    description: 'Tenant name must be a non-empty string',
    example: 'Company LTDA',
  })
  @IsStringValid()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: 'Tenant domain must be a non-empty string',
    example: 'company.com',
  })
  @IsStringValid()
  @MaxLength(150)
  domain: string;
}
