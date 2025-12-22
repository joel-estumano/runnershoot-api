import { InternalServerErrorException, Module } from '@nestjs/common';
import { ConfigModule, ConfigType, registerAs } from '@nestjs/config';
import { join } from 'path';
import { DataSource } from 'typeorm';
import { MysqlConnectionOptions } from 'typeorm/driver/mysql/MysqlConnectionOptions';

export const databaseConfig = registerAs(
  'databaseConfig',
  (): MysqlConnectionOptions => {
    const host = process.env.DB_HOST;
    const port = Number(process.env.DB_PORT);
    const username = process.env.DB_USERNAME;
    const password = process.env.DB_PASSWORD;
    const database = process.env.DB_DATABASE;

    if (!host || !port || !username || !password || !database) {
      throw new InternalServerErrorException(
        'Database configuration is missing. Please ensure DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, and DB_DATABASE are properly set in the environment variables.',
      );
    }

    return {
      type: 'mysql',
      host,
      port,
      username,
      password,
      database,
      entities: [join(__dirname, '../../../**/*.entity{.ts,.js}')],
      synchronize: true,
    };
  },
);

const databaseProviders = [
  {
    provide: 'DATA_SOURCE',
    inject: [databaseConfig.KEY],
    useFactory: async (
      databaseConfigKey: ConfigType<typeof databaseConfig>,
    ) => {
      const dataSource = new DataSource(databaseConfigKey);
      return dataSource.initialize();
    },
  },
];

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env'],
      isGlobal: true,
      load: [databaseConfig],
    }),
  ],
  providers: [...databaseProviders],
  exports: [...databaseProviders],
})
export class DatabaseModule {}
