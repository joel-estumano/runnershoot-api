import { Roles } from '@modules/auth/decorators/user-roles.decorator';
import { RolesGuard } from '@modules/auth/guards/roles/roles.guard';
import { EnumUserRole } from '@modules/users/entities/user.entity';
import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CreateTenantDto } from './dto/create-tenant.dto';
import { OutputTenantDto } from './dto/output-tenant.dto';
import { TenantsService } from './tenants.service';

@Controller('tenants')
@ApiTags('Tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(EnumUserRole.SYSTEM)
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
