import { DatabaseModule } from '@common/modules/database/database.module';
import { EmailModule } from '@common/modules/email/email.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsersModule } from '../users/users.module';
import { ProfileEntity } from './entities/profile.entity';
import { ProfilesController } from './profiles.controller';
import { ProfilesService } from './profiles.service';

@Module({
  controllers: [ProfilesController],
  imports: [
    DatabaseModule,
    UsersModule,
    EmailModule,
    TypeOrmModule.forFeature([ProfileEntity]),
  ],
  providers: [ProfilesService],
})
export class ProfilesModule {}
