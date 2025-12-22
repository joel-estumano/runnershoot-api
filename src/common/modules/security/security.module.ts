import { Module } from '@nestjs/common';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

import securityConfig from './configs/security.config';
import { SecurityService } from './security.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env'],
      isGlobal: true,
      load: [securityConfig],
    }),
    JwtModule.registerAsync({
      inject: [securityConfig.KEY],
      useFactory: (securityConfigKey: ConfigType<typeof securityConfig>) => ({
        secret: securityConfigKey.secret,
        signOptions: { expiresIn: securityConfigKey.expiresIn },
      }),
    }),
  ],
  providers: [SecurityService],
  exports: [SecurityService],
})
export class SecurityModule {}
