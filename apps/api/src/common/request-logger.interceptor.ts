import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { Observable } from 'rxjs';

@Injectable()
export class RequestLoggerInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const started = Date.now();

    response.on('finish', () => {
      const ms = Date.now() - started;
      const line = `${request.method} ${request.originalUrl} ${response.statusCode} ${ms}ms`;
      if (response.statusCode >= 500) {
        this.logger.error(line);
        return;
      }
      if (response.statusCode >= 400) {
        this.logger.warn(line);
        return;
      }
      this.logger.log(line);
    });

    return next.handle();
  }
}
