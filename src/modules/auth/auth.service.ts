import { TokenService } from '@common/modules/token/token.service';
import { UserEntity } from '@modules/users/entities/user.entity';
import { UsersService } from '@modules/users/users.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  constructor(
    private readonly tokenService: TokenService,
    private readonly usersService: UsersService,
  ) {}

  async validateUser(email: string, pass: string): Promise<UserEntity | null> {
    const user = await this.usersService.findOne('email', email, [
      'id',
      'email',
      'role',
      'password',
    ]);

    if (!user || !user.password) return null;

    const match = await this.tokenService.comparePassword(pass, user.password);
    return match ? user : null;
  }

  login(user: UserEntity) {
    const payload = { sub: user.id, email: user.email, role: user.role };

    const access_token = this.tokenService.sign(payload);

    const decoded = this.tokenService.decodeToken(access_token) as {
      exp?: number;
    } | null;
    const maxAge =
      decoded && decoded.exp ? decoded.exp * 1000 - Date.now() : undefined;

    return {
      access_token,
      user: payload,
      maxAge,
    };
  }
}
