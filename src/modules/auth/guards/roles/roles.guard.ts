import { USER_ROLES_KEY } from '@modules/auth/decorators/user-roles.decorator';
import { EnumUserRole } from '@modules/users/entities/user.entity';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';

interface RequestWithUser extends Request {
  user: { role: EnumUserRole };
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<EnumUserRole[]>(
      USER_ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredRoles) {
      return true; // se não tiver roles na rota, libera
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user; // preenchido pelo JwtStrategy

    return requiredRoles.includes(user.role);
  }
}
