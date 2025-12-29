import { EnumUserRole } from '@modules/users/entities/user.entity';
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';

interface RequestWithUser extends Request {
  user: { id: number; role: EnumUserRole };
}

@Injectable()
export class OwnershipGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;
    const targetUserId = Number(request.params.id);

    // Se for admin, pode tudo
    if (user.role === EnumUserRole.ADMIN) {
      return true;
    }

    // Se não for admin, só pode acessar o próprio recurso
    if (user.id !== targetUserId) {
      throw new ForbiddenException();
    }

    return true;
  }
}
