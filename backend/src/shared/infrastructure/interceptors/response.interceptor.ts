import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { PaginatedResult } from '@shared/application/pagination';

export interface ApiEnvelope<T> {
  data: T;
  meta: Record<string, unknown>;
}

function isPaginatedResult(value: unknown): value is PaginatedResult<unknown> {
  return (
    !!value &&
    typeof value === 'object' &&
    'items' in (value as Record<string, unknown>) &&
    'meta' in (value as Record<string, unknown>)
  );
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ApiEnvelope<T>> {
  intercept(_context: ExecutionContext, next: CallHandler<T>): Observable<ApiEnvelope<T>> {
    return next.handle().pipe(
      map((result) => {
        const timestamp = new Date().toISOString();

        if (isPaginatedResult(result)) {
          return {
            data: result.items as unknown as T,
            meta: { ...result.meta, timestamp },
          };
        }

        return {
          data: (result ?? null) as T,
          meta: { timestamp },
        };
      }),
    );
  }
}
