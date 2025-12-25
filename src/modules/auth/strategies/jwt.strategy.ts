import jwtConfig from '@common/modules/token/configs/jwt.config';
import { UserEntity } from '@modules/users/entities/user.entity';
import { Inject, Injectable } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import type { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(jwtConfig.KEY)
    private readonly jwtConfigKey: ConfigType<typeof jwtConfig>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) =>
          (req?.cookies as Record<string, string> | undefined)?.[
            'access_token'
          ] ?? null,
      ]),
      secretOrKey: jwtConfigKey.secret ?? '',
      ignoreExpiration: false,
    });
  }

  validate(payload: UserEntity & { sub: string }) {
    const returns = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };
    return returns;
  }
}
