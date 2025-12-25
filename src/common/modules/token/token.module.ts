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
        signOptions: { expiresIn: jwtConfigKey.expiresIn },
      }),
    }),
  ],
  providers: [TokenService],
  exports: [TokenService],
})
export class TokenModule {}
