import { DatabaseModule } from '@common/modules/database/database.module';
import { QueuesModule } from '@common/modules/queues/queues.module';
import { SecurityModule } from '@common/modules/security/security.module';
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserSubscriber } from './entities/subscribers/user.subscriber';
import { UserEntity } from './entities/user.entity';
import { UserSecurityTokenEntity } from './entities/user-security-token.entity';
import { usersEventsProviders } from './events/user.event';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  controllers: [UsersController],
  imports: [
    DatabaseModule,
    TypeOrmModule.forFeature([UserEntity, UserSecurityTokenEntity]),
    SecurityModule,
    QueuesModule,
    BullModule.registerQueue({
      name: 'users',
    }),
  ],
  providers: [UsersService, UserSubscriber, ...usersEventsProviders],
  exports: [UsersService],
})
export class UsersModule {}
