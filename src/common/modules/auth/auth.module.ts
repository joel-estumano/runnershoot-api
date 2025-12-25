import { Module } from '@nestjs/common';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

import { AuthService } from './auth.service';
import authConfig from './configs/auth.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env'],
      isGlobal: true,
      load: [authConfig],
    }),
    JwtModule.registerAsync({
      inject: [authConfig.KEY],
      useFactory: (authConfigKey: ConfigType<typeof authConfig>) => ({
        secret: authConfigKey.secret,
        signOptions: { expiresIn: authConfigKey.expiresIn },
      }),
    }),
  ],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
