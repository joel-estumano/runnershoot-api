import { Module } from '@nestjs/common';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { MailerModule, MailerOptions } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';

import mailerConfig from './configs/mailer.config';
import { EmailService } from './email.service';

const templatesPath = `${__dirname}/templates/`;

const handlebarsHelpers = {
  formatDate: (date: string) => {
    return new Date(date).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  },
};

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env.local'],
      isGlobal: true,
      load: [mailerConfig],
    }),
    MailerModule.forRootAsync({
      inject: [mailerConfig.KEY],
      useFactory: (
        mailerConfigKey: ConfigType<typeof mailerConfig>,
      ): Promise<MailerOptions> | MailerOptions => ({
        transport: {
          service: 'gmail',
          auth: {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
            user: mailerConfigKey.credentials.user,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
            pass: mailerConfigKey.credentials.pass,
          },
        },
        defaults: {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          from: `Runner Shoot <${mailerConfigKey.credentials.user}>`,
        },
        template: {
          dir: templatesPath,
          adapter: new HandlebarsAdapter(handlebarsHelpers, {
            inlineCssEnabled: true,
          }),
          options: {
            strict: true,
          },
        },
      }),
    }),
  ],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
