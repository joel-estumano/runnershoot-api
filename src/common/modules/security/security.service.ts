import { randomBytes, scrypt } from 'node:crypto';
import { promisify } from 'node:util';

import { Inject, Injectable } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { StringValue } from 'ms';

import securityConfig from './configs/security.config';

@Injectable()
export class SecurityService {
  private scryptAsync = promisify(scrypt);

  constructor(
    @Inject(securityConfig.KEY)
    private readonly securityConfigKey: ConfigType<typeof securityConfig>,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Gera um hash seguro para a senha informada utilizando o algoritmo scrypt.
   * O hash é composto por um salt aleatório concatenado com a chave derivada,
   * ambos codificados em base64 e separados por dois pontos.
   *
   * @param password senha em texto puro que será transformada em hash.
   * @returns uma string contendo o salt e o hash da senha no formato "salt:hash".
   */
  async hashPassword(password: string): Promise<string> {
    const salt = randomBytes(16).toString('base64');
    const derivedKey = (await this.scryptAsync(
      `${password}${this.securityConfigKey.secret as string}`,
      salt,
      64,
    )) as Buffer;
    return `${salt}:${derivedKey.toString('base64')}`;
  }

  /**
   * Compara uma senha em texto puro com um hash previamente armazenado.
   * O método utiliza o mesmo algoritmo scrypt e a mesma chave secreta para
   * derivar a chave e verificar se corresponde ao hash fornecido.
   *
   * @param plainPassword senha em texto puro informada pelo usuário.
   * @param storedHash hash previamente armazenado no formato "salt:hash".
   * @returns `true` se a senha informada corresponde ao hash armazenado,
   *          caso contrário `false`.
   */
  async comparePassword(
    plainPassword: string,
    storedHash: string,
  ): Promise<boolean> {
    const [salt, key] = storedHash.split(':');
    const derivedKey = (await this.scryptAsync(
      `${plainPassword}${this.securityConfigKey.secret as string}`,
      salt,
      64,
    )) as Buffer;
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
