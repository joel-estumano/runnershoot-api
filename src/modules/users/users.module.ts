import { DatabaseModule } from '@common/modules/database/database.module';
import { QueuesModule } from '@common/modules/queues/queues.module';
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { DataSource } from 'typeorm';

import { UserEntity } from './entities/user.entity';
import { UserSecurityTokenEntity } from './entities/user-security-token.entity';
import { usersEventsProviders } from './events/user.event';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

const usersProviders = [
  {
    provide: 'USERS_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(UserEntity),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'USERS_SECURITY_TOKEN_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(UserSecurityTokenEntity),
    inject: ['DATA_SOURCE'],
  },
];

@Module({
  controllers: [UsersController],
  imports: [
    DatabaseModule,
    QueuesModule,
    BullModule.registerQueue({
      name: 'users',
    }),
  ],
  providers: [UsersService, ...usersProviders, ...usersEventsProviders],
  exports: [UsersService],
})
export class UsersModule {}
