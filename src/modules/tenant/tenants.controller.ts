import { Body, Controller, Post } from '@nestjs/common';
import { ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CreateTenantDto } from './dto/create-tenant.dto';
import { OutputTenantDto } from './dto/output-tenant.dto';
import { TenantsService } from './tenants.service';

@Controller('tenants')
@ApiTags('Tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new tenant',
    description: 'This endpoint creates a new tenant.',
  })
  @ApiCreatedResponse({
    description: 'Tenant created successfully.',
    type: OutputTenantDto,
  })
  create(@Body() createTenantDto: CreateTenantDto) {
    return this.tenantsService.create(createTenantDto);
  }
}
