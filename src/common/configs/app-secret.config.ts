import { InternalServerErrorException } from '@nestjs/common';
import { registerAs } from '@nestjs/config';

export default registerAs('appSecretConfig', () => {
  const secret = process.env.APP_SECRET_KEY;
  const expiresIn = process.env.APP_SECRET_KEY_EXPIRES_IN;

  if (!secret || !expiresIn) {
    throw new InternalServerErrorException(
      'Application secret configuration is missing. Please ensure APP_SECRET_KEY and APP_SECRET_KEY_EXPIRES_IN are properly set in the environment variables.',
    );
  }

  return {
    secret,
    expiresIn,
  };
});
