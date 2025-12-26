import { Module } from '@nestjs/common';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

import jwtConfig from './configs/jwt.config';
import { TokenService } from './token.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env'],
      isGlobal: true,
      load: [jwtConfig],
    }),
    JwtModule.registerAsync({
      inject: [jwtConfig.KEY],
      useFactory: (jwtConfigKey: ConfigType<typeof jwtConfig>) => ({
        secret: jwtConfigKey.secret,
        signOptions: {
          expiresIn: jwtConfigKey.expiresIn,
          algorithm: 'HS256', // 🔒 Algoritmo de assinatura (HMAC + SHA-256)
        },
        /**
         * 🔑 Orientações sobre o comprimento do secret:
         *
         * HS256 (SHA-256)
         * - Recomendado: pelo menos 32 bytes (256 bits)
         * - Equivale a ~64 caracteres hexadecimais
         * - Exemplo: "9f8b3c2d6a7e4f1a9c0d8b7f6e3a2c1d9f8b3c2d6a7e4f1a9c0d8b7f6e3a2e1d"
         *
         * HS384 (SHA-384)
         * - Recomendado: 48 bytes (384 bits)
         * - Equivale a ~96 caracteres hexadecimais
         * - Exemplo: "a1b2c3d4e5f67890abcdef1234567890a1b2c3d4e5f67890abcdef1234567890a1b2c3d4e5f67890"
         *
         * HS512 (SHA-512)
         * - Recomendado: 64 bytes (512 bits)
         * - Equivale a ~128 caracteres hexadecimais
         * - Exemplo: "f1e2d3c4b5a6978877665544332211ffeeddccbbaa99887766554433221100ffeeddccbbaa99887766554433221100ff"
         *
         * ⚠️ Sempre usar valores aleatórios e longos
         * ⚠️ Nunca expor o secret no código-fonte
         * ✅ Guardar em variáveis de ambiente (process.env.JWT_SECRET)
         *
         * 👉 Para gerar um secret seguro no Node.js:
         *    node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
         */
      }),
    }),
  ],
  providers: [TokenService],
  exports: [TokenService],
})
export class TokenModule {}
