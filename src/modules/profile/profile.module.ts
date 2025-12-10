import { DatabaseModule } from '@common/modules/database/database.module';
import { EmailModule } from '@common/modules/email/email.module';
import { Module } from '@nestjs/common';
import { DataSource } from 'typeorm';

import { UsersModule } from '../users/users.module';
import { ProfileEntity } from './entities/profile.entity';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';

const profilesProviders = [
  {
    provide: 'PROFILES_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(ProfileEntity),
    inject: ['DATA_SOURCE'],
  },
];

@Module({
  controllers: [ProfileController],
  imports: [DatabaseModule, UsersModule, EmailModule],
  providers: [ProfileService, ...profilesProviders],
})
export class ProfileModule {}
