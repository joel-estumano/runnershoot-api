import { randomBytes, scrypt } from 'node:crypto';
import { promisify } from 'node:util';

import { Inject, Injectable } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

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
   *
   * @param password
   * @returns
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
   *
   * @param plainPassword
   * @param storedHash
   * @returns
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
  generateToken(payload: object): string {
    return this.jwtService.sign(payload);
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
