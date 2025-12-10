import { randomBytes, scrypt } from 'node:crypto';
import { promisify } from 'node:util';

const scryptAsync = promisify(scrypt);

export class PasswordHelper {
  static parseExpiresIn(expiresIn: string): number {
    const regex = /^(\d+)([dhm])$/i;
    const match = expiresIn.match(regex);

    if (!match) {
      return 24 * 60 * 60;
    }

    const value = parseInt(match[1], 10);
    const unit = match[2].toLowerCase();

    switch (unit) {
      case 'd':
        return value * 24 * 60 * 60;
      case 'h':
        return value * 60 * 60;
      case 'm':
        return value * 60;
      default:
        return 24 * 60 * 60;
    }
  }

  static async hashPassword(
    password: string,
    secretKey: string,
  ): Promise<string> {
    const salt = randomBytes(16).toString('base64');
    const derivedKey = (await scryptAsync(
      password + secretKey,
      salt,
      64,
    )) as Buffer;
    return `${salt}:${derivedKey.toString('base64')}`;
  }

  static async comparePassword(
    plainPassword: string,
    storedHash: string,
    secretKey: string,
  ): Promise<boolean> {
    const [salt, key] = storedHash.split(':');
    const derivedKey = (await scryptAsync(
      plainPassword + secretKey,
      salt,
      64,
    )) as Buffer;
    return key === derivedKey.toString('base64');
  }

  // Geração
  // 🔑 Geração
  static async generateSecurityToken(
    secretKey: string,
    expiresIn: string = '1h',
  ): Promise<{ token: string; validUntil: Date }> {
    const salt = randomBytes(16).toString('hex');
    const nonce = randomBytes(32).toString('hex');

    // usa secretKey + nonce como entrada
    const derivedKey = (await scryptAsync(
      secretKey + nonce,
      salt,
      64,
    )) as Buffer;

    // token final: salt:nonce:hash
    const token = `${salt}:${nonce}:${derivedKey.toString('hex')}`;
    const validUntil = new Date(
      Date.now() + this.parseExpiresIn(expiresIn) * 1000,
    );

    return { token, validUntil };
  }

  // Verificação
  static async verifySecurityToken(
    secretKey: string,
    token: string,
    validUntil: Date,
  ): Promise<boolean> {
    if (new Date() > validUntil) {
      return false; // expirado
    }

    const [salt, nonce, hash] = token.split(':');
    if (!salt || !nonce || !hash) return false;

    const derivedKey = (await scryptAsync(
      secretKey + nonce,
      salt,
      64,
    )) as Buffer;

    return hash === derivedKey.toString('hex');
  }
}
