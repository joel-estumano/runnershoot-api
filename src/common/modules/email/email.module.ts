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
      ): Promise<MailerOptions> | MailerOptions => {
        return {
          transport: {
            service: 'gmail',
            auth: {
              user: mailerConfigKey.user,
              pass: mailerConfigKey.pass,
            },
          },
          defaults: {
            from: `Runner Shoot <${mailerConfigKey.user}>`,
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
        };
      },
    }),
  ],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
