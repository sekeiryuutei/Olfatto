import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { DomainException } from '@shared/domain/domain.exception';

interface ErrorEnvelope {
  statusCode: number;
  code: string;
  message: string;
  timestamp: string;
  path: string;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const envelope = this.buildEnvelope(exception, request.path);

    // Log method/path/status/message only — never request bodies, headers,
    // passwords, JWTs or refresh tokens (point 67).
    this.logger.error(`${request.method} ${request.path} -> ${envelope.statusCode} ${envelope.code}`);

    response.status(envelope.statusCode).json(envelope);
  }

  private buildEnvelope(exception: unknown, path: string): ErrorEnvelope {
    const timestamp = new Date().toISOString();

    if (exception instanceof DomainException) {
      return {
        statusCode: exception.httpStatus,
        code: exception.code,
        message: exception.message,
        timestamp,
        path,
      };
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const body = exception.getResponse();
      const message =
        typeof body === 'string'
          ? body
          : Array.isArray((body as Record<string, unknown>)?.message)
            ? ((body as Record<string, unknown>).message as string[]).join('; ')
            : ((body as Record<string, unknown>)?.message as string) || exception.message;

      return {
        statusCode: status,
        code: this.codeForStatus(status),
        message,
        timestamp,
        path,
      };
    }

    // Unexpected error — never leak internals to the client.
    this.logger.error(exception instanceof Error ? exception.stack : String(exception));
    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Something went wrong. Please try again.',
      timestamp,
      path,
    };
  }

  private codeForStatus(status: number): string {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return 'VALIDATION_ERROR';
      case HttpStatus.UNAUTHORIZED:
        return 'UNAUTHORIZED';
      case HttpStatus.FORBIDDEN:
        return 'FORBIDDEN';
      case HttpStatus.NOT_FOUND:
        return 'NOT_FOUND';
      case HttpStatus.CONFLICT:
        return 'CONFLICT';
      case HttpStatus.TOO_MANY_REQUESTS:
        return 'RATE_LIMITED';
      default:
        return 'HTTP_ERROR';
    }
  }
}
