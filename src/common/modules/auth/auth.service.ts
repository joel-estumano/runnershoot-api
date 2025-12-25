import { createHmac, randomBytes, scrypt } from 'node:crypto';
import { promisify } from 'node:util';

import { Inject, Injectable } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { StringValue } from 'ms';

import authConfig from './configs/auth.config';

@Injectable()
export class AuthService {
  private scryptAsync = promisify(scrypt);

  constructor(
    @Inject(authConfig.KEY)
    private readonly authConfigKey: ConfigType<typeof authConfig>,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Gera um hash seguro para a senha informada utilizando o algoritmo scrypt,
   * combinando salt aleatório e um "pepper" derivado de um segredo da aplicação.
   *
   * O processo funciona assim:
   * 1. Um salt aleatório é gerado e codificado em base64.
   * 2. A senha em texto puro é transformada por meio de HMAC-SHA256,
   *    usando o secret da aplicação como chave (pepper).
   * 3. O resultado do HMAC é passado para o algoritmo scrypt junto com o salt,
   *    produzindo uma chave derivada resistente a ataques de força bruta.
   * 4. O valor final armazenado é composto pelo salt e pela chave derivada,
   *    ambos em base64 e separados por dois pontos.
   *
   * @param password Senha em texto puro que será transformada em hash.
   * @returns Uma string contendo o salt e o hash da senha no formato "salt:hash".
   */
  async hashPassword(password: string): Promise<string> {
    const salt = randomBytes(16).toString('base64');

    const peppered = createHmac('sha256', this.authConfigKey.secret as string)
      .update(password)
      .digest('base64');

    const derivedKey = (await this.scryptAsync(peppered, salt, 64)) as Buffer;

    return `${salt}:${derivedKey.toString('base64')}`;
  }

  /**
   * Compara uma senha em texto puro com um hash previamente armazenado.
   *
   * O processo funciona assim:
   * 1. O hash armazenado é dividido em duas partes: salt e chave derivada.
   * 2. A senha informada pelo usuário é transformada por meio de HMAC-SHA256,
   *    utilizando o secret da aplicação como chave (pepper).
   * 3. O resultado do HMAC é passado para o algoritmo scrypt junto com o salt,
   *    produzindo uma nova chave derivada.
   * 4. Essa chave derivada é comparada com o hash armazenado para verificar se
   *    correspondem.
   *
   * @param plainPassword Senha em texto puro informada pelo usuário.
   * @param storedHash Hash previamente armazenado no formato "salt:hash".
   * @returns `true` se a senha informada corresponde ao hash armazenado,
   *          caso contrário `false`.
   */
  async comparePassword(
    plainPassword: string,
    storedHash: string,
  ): Promise<boolean> {
    const [salt, key] = storedHash.split(':');

    const peppered = createHmac('sha256', this.authConfigKey.secret as string)
      .update(plainPassword)
      .digest('base64');

    const derivedKey = (await this.scryptAsync(peppered, salt, 64)) as Buffer;

    return key === derivedKey.toString('base64');
  }

  /**
   * Gera um JSON Web Token (JWT) assinado com a chave secreta configurada.
   *
   * @param payload objeto contendo os dados que serão incluídos no token (ex.: { sub: userId }).
   * @param expiresIn tempo de expiração do token. Pode ser um número em segundos ou uma string no formato aceito pela lib `ms` (ex.: "1h", "2d").
   *                  Se não for informado, será usado o valor padrão definido no JwtModule.
   * @returns token JWT assinado como string.
   */
  generateToken(payload: object, expiresIn?: StringValue | number): string {
    return this.jwtService.sign(payload, expiresIn ? { expiresIn } : undefined);
  }

  /**
   * Verifica a validade de um JSON Web Token (JWT).
   *
   * @param token token JWT a ser validado.
   * @returns objeto decodificado do token se válido; caso contrário, retorna `null` (token inválido ou expirado).
   */
  verifyToken(token: string): object | null {
    try {
      return this.jwtService.verify(token);
    } catch {
      return null;
    }
  }

  /**
   * Decodifica um JSON Web Token (JWT) sem verificar sua validade ou assinatura.
   *
   * @param token token JWT a ser decodificado.
   * @returns objeto decodificado do token ou `null` se não for possível decodificar.
   */
  decodeToken(token: string): object | null {
    return this.jwtService.decode(token);
  }
}
