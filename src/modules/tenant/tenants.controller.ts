import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { TenantsService } from './tenants.service';

@Controller('tenants')
@ApiTags('Tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}
}
