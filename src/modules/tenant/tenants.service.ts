import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateTenantDto } from './dto/create-tenant.dto';
import { TenantEntity } from './entities/tenant.entity';

@Injectable()
export class TenantsService {
  constructor(
    @InjectRepository(TenantEntity)
    private readonly tenantsRepository: Repository<TenantEntity>,
  ) {}

  async create(createTenantDto: CreateTenantDto): Promise<TenantEntity> {
    const profile = this.tenantsRepository.create(createTenantDto);
    return await this.tenantsRepository.save(profile);
  }
}
