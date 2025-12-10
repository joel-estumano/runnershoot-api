import { ApiProperty } from '@nestjs/swagger';

export class OutputBaseDto {
  @ApiProperty({
    description: 'Unique identifier for the entity.',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Indicates whether the entity is active.',
    example: true,
  })
  active: boolean;

  @ApiProperty({
    description: 'Date when the entity was created.',
    example: '2023-04-06T11:54:03.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Date when the entity was last updated.',
    example: '2023-05-30T12:20:00.000Z',
  })
  updatedAt: Date;
}
