import { EnumUserRole } from '@modules/users/entities/user.entity';
import { SetMetadata } from '@nestjs/common';

export const USER_ROLES_KEY = 'roles';
export const Roles = (...roles: EnumUserRole[]) =>
  SetMetadata(USER_ROLES_KEY, roles);
