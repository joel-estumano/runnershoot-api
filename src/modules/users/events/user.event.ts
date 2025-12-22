import { EmailService } from '@common/modules/email/email.service';
import { InjectQueue, Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Job, Queue } from 'bullmq';

import { UserEntity } from '../entities/user.entity';

export type UserCreatedProps = Pick<
  UserEntity,
  'firstName' | 'lastName' | 'email'
> & { emailVerificationLink: string };

export class UserCreatedEvent implements UserCreatedProps {
  firstName: string;
  lastName: string;
  email: string;
  emailVerificationLink: string;
  constructor(args: UserCreatedProps) {
    Object.assign(this, args);
  }
}

@Injectable()
class UsersListeners {
  constructor(@InjectQueue('users') private readonly queue: Queue) {}

  @OnEvent('user.created', { async: true })
  async handleEvent(event: UserCreatedEvent) {
    await this.queue.add('users', event);
  }
}

@Processor('users')
class UsersConsumer extends WorkerHost {
  private readonly logger = new Logger(UsersConsumer.name);

  constructor(private readonly emailService: EmailService) {
    super();
  }

  async process(job: Job<UserCreatedEvent>): Promise<void> {
    this.logger.log(`Processing job: ${job.id}, Attempt: #${job.attemptsMade}`);
    await this.emailService.sendMail({
      to: job.data.email,
      subject: 'Welcome to the Runner Shoot platform! 🎉',
      template: 'welcome-email',
      context: {
        data: {
          firstName: job.data.firstName,
          lastName: job.data.lastName,
          email: job.data.email,
          emailVerificationLink: job.data.emailVerificationLink,
        },
      },
    });
  }
}

export const usersEventsProviders = [
  UsersListeners,
  UsersConsumer,
  EmailService,
];
