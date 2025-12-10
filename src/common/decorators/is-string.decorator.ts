import { applyDecorators } from '@nestjs/common';
import { Transform, TransformFnParams } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

export function IsStringValid(): PropertyDecorator {
  return applyDecorators(
    IsNotEmpty(),
    IsString(),
    Transform(({ value }: TransformFnParams): unknown =>
      typeof value === 'string' && value ? value.trim() : value,
    ),
  );
}
