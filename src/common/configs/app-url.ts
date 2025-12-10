import { InternalServerErrorException } from '@nestjs/common';
import { registerAs } from '@nestjs/config';

export default registerAs('appUrlConfig', () => {
  const url = process.env.APP_URL;

  if (!url) {
    throw new InternalServerErrorException(
      'Application URL configuration is missing. Please ensure APP_URL is properly set in the environment variables.',
    );
  }

  return {
    url,
  };
});
