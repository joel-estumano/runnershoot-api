import { InternalServerErrorException } from '@nestjs/common';
import { registerAs } from '@nestjs/config';
import { AuthenticationCredentials } from 'nodemailer/lib/smtp-connection';

export default registerAs('mailerConfig', (): AuthenticationCredentials => {
  const user = process.env.GOOGLE_MAIL;
  const pass = process.env.GOOGLE_APP_PASSWORD;

  if (!user || !pass) {
    throw new InternalServerErrorException(
      'Nodemailer configuration variables are missing. Please check GOOGLE_MAIL and GOOGLE_APP_PASSWORD.',
    );
  }

  return {
    credentials: {
      user,
      pass,
    },
  };
});
