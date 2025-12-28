import { TokenService } from '@common/modules/token/token.service';
import { EnumUserRole, UserEntity } from '@modules/users/entities/user.entity';
import { UsersService } from '@modules/users/users.service';
import { Injectable } from '@nestjs/common';

/**
 * SignPayload define a estrutura de dados incluída no corpo de um token JWT.
 *
 * Esse payload é usado para autenticação e autorização, garantindo que o sistema
 * saiba quem é o usuário, como contatá-lo e quais permissões ele possui.
 */
export interface SignPayload {
  /**
   * Identificador único do sujeito (usuário) do token.
   *
   * - Campo **padrão** definido pela especificação RFC 7519 (JWT).
   * - Representa o "subject" (sujeito) do token, ou seja, o dono dele.
   * - Corresponde ao ID do usuário no banco de dados.
   *
   * Referência: https://datatracker.ietf.org/doc/html/rfc7519
   */
  sub: number;

  /**
   * Endereço de e-mail associado ao usuário.
   *
   * - Usado para identificar o usuário de forma legível.
   * - Pode servir para validação adicional ou envio de comunicações.
   */
  email: string;

  /**
   * Papel (role) atribuído ao usuário dentro do sistema.
   *
   * - Baseado na enumeração `EnumUserRole`.
   * - Define o nível de acesso e permissões disponíveis.
   *
   * Valores possíveis:
   * - `ADMIN`: Administrador, com acesso total ao sistema.
   * - `USER`: Participante comum, pode visualizar eventos e se inscrever.
   * - `ORGANIZER`: Organizador de eventos, pode criar e gerenciar inscrições.
   */
  role: EnumUserRole;
}

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
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const access_token = this.tokenService.sign<SignPayload>(payload);

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
