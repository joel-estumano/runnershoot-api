import { DatabaseModule } from '@common/modules/database/database.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TenantEntity } from './entities/tenant.entity';
import { TenantController } from './tenant.controller';
import { TenantService } from './tenant.service';

@Module({
  providers: [TenantService],
  imports: [DatabaseModule, TypeOrmModule.forFeature([TenantEntity])],
  controllers: [TenantController],
})
export class TenantModule {}
