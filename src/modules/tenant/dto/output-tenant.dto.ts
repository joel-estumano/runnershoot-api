import { OutputBaseDto } from '@common/shared/dto/output-base.dto';
import { IntersectionType } from '@nestjs/swagger';

import { CreateTenantDto } from './create-tenant.dto';

export class OutputTenantDto extends IntersectionType(
  CreateTenantDto,
  OutputBaseDto,
) {}
