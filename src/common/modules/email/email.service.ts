import { Injectable, Logger } from '@nestjs/common';
import { ISendMailOptions, MailerService } from '@nestjs-modules/mailer';
import { SentMessageInfo } from 'nodemailer';

@Injectable()
export class EmailService {
  private logger = new Logger(EmailService.name);

  constructor(private readonly mailerService: MailerService) {}

  async sendMail(
    options: Omit<ISendMailOptions, 'from' | 'template'> & {
      template: 'welcome-email';
    },
  ): Promise<SentMessageInfo> {
    return await this.mailerService
      .sendMail(options)
      .catch((error: unknown) => {
        this.logger.error({ error });
        throw error;
      });
  }
}
