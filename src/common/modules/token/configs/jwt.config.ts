import { InternalServerErrorException } from '@nestjs/common';
import { registerAs } from '@nestjs/config';
import { JwtSignOptions } from '@nestjs/jwt';
import { StringValue } from 'ms';

export default registerAs('jwtConfig', (): JwtSignOptions => {
  const secret = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_EXPIRES_IN as StringValue | number;

  if (!secret || !expiresIn) {
    throw new InternalServerErrorException(
      'JWT configuration is missing. Please ensure JWT_SECRET and JWT_EXPIRES_IN are properly set in the environment variables.',
    );
  }

  return {
    secret,
    expiresIn,
  };
});
