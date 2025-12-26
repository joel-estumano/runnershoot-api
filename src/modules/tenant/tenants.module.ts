import { DatabaseModule } from '@common/modules/database/database.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TenantEntity } from './entities/tenant.entity';
import { TenantsController } from './tenants.controller';
import { TenantsService } from './tenants.service';

@Module({
  providers: [TenantsService],
  imports: [DatabaseModule, TypeOrmModule.forFeature([TenantEntity])],
  controllers: [TenantsController],
})
export class TenantsModule {}
