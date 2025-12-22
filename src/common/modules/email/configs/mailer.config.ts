import { InternalServerErrorException } from '@nestjs/common';
import { registerAs } from '@nestjs/config';

export default registerAs(
  'mailerConfig',
  (): { user: string; pass: string } => {
    const user = process.env.GOOGLE_MAIL;
    const pass = process.env.GOOGLE_APP_PASSWORD;

    if (!user || !pass) {
      throw new InternalServerErrorException(
        'Nodemailer configuration variables are missing. Please check GOOGLE_MAIL and GOOGLE_APP_PASSWORD.',
      );
    }

    return {
      user,
      pass,
    };
  },
);
