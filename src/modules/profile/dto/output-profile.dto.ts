import { OutputBaseDto } from '@common/shared/dto/output-base.dto';
import { IntersectionType } from '@nestjs/swagger';

import { CreateProfileDto } from './create-profile.dto';

export class OutputProfileDto extends IntersectionType(
  CreateProfileDto,
  OutputBaseDto,
) {}
