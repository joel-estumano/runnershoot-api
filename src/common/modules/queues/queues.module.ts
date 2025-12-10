import { BullModule, BullRootModuleOptions } from '@nestjs/bullmq';
import { InternalServerErrorException, Module } from '@nestjs/common';
import { ConfigModule, ConfigType, registerAs } from '@nestjs/config';

const queuesConfig = registerAs('queuesConfig', (): BullRootModuleOptions => {
  const host = process.env.REDIS_HOST;
  const port = process.env.REDIS_PORT;
  const username = process.env.REDIS_USER;
  const password = process.env.REDIS_PASSWORD;

  if (!host || !port || !username || !password) {
    throw new InternalServerErrorException(
      'Redis configuration variables are missing. Please check REDIS_HOST, REDIS_PORT, REDIS_USER, and REDIS_PASSWORD.',
    );
  }

  return {
    connection: {
      host, // Endereço do servidor Redis (ex: 'localhost' ou IP da instância).
      port: Number(port), // Porta de conexão do Redis (padrão é 6379).
      username, // Usuário para autenticação no Redis (se configurado).
      password, // Senha para autenticação no Redis.
    },

    defaultJobOptions: {
      removeOnComplete: 100, // Quantidade de jobs concluídos que serão mantidos no histórico.
      // Aqui, os últimos 100 jobs concluídos ficam armazenados, os anteriores são removidos.

      removeOnFail: 1000, // Quantidade de jobs que falharam que serão mantidos no histórico.
      // Aqui, os últimos 1000 jobs com erro ficam armazenados.

      attempts: 3, // Número máximo de tentativas para executar um job antes de ser marcado como falho.
      // Exemplo: se um job falhar, ele será reprocessado até 3 vezes.

      backoff: {
        type: 'exponential', // Estratégia de espera entre tentativas. "exponential" significa que o tempo de espera
        // aumenta exponencialmente a cada falha (ex: 1s, 2s, 4s...).
        delay: 1000, // Tempo inicial de espera (em milissegundos). Aqui começa com 1 segundo.
      },
    },
  };
});

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env'],
      isGlobal: true,
      load: [queuesConfig],
    }),
    BullModule.forRootAsync({
      inject: [queuesConfig.KEY],
      useFactory: (queuesConfigKey: ConfigType<typeof queuesConfig>) =>
        queuesConfigKey,
    }),
  ],
})
export class QueuesModule {}
