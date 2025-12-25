import { DatabaseModule } from '@common/modules/database/database.module';
import { EmailModule } from '@common/modules/email/email.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsersModule } from '../users/users.module';
import { ProfileEntity } from './entities/profile.entity';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';

@Module({
  controllers: [ProfileController],
  imports: [
    DatabaseModule,
    UsersModule,
    EmailModule,
    TypeOrmModule.forFeature([ProfileEntity]),
  ],
  providers: [ProfileService],
})
export class ProfileModule {}
