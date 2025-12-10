import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { QueryFailedError } from 'typeorm';

interface MysqlDriverError {
  code?: string;
  sqlMessage?: string;
  constraint?: string;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | object = 'Internal server error';

    // Caso seja HttpException (erros lançados pelo Nest)
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.getResponse();
    }

    // Caso seja erro de banco (TypeORM / MySQL)
    else if (exception instanceof QueryFailedError) {
      status = HttpStatus.BAD_REQUEST;

      const driverError = exception.driverError as MysqlDriverError; // aqui tipamos corretamente
      message = driverError.sqlMessage ?? exception.message;
    }

    // Caso seja erro genérico
    else if (exception instanceof Error) {
      message = exception.message;
    }

    // Log simples
    this.logger.error(
      `Status: ${status} | Path: ${request.url} | Error: ${JSON.stringify(message)}`,
    );

    // Retorno padronizado
    response.status(status).json({
      timestamp: new Date().toISOString(),
      path: request.url,
      error: message,
    });
  }
}
