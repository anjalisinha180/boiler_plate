import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Observable, map } from 'rxjs';

import { debugSqlStorage } from './debug-sql.storage';

type AnyRecord = Record<string, unknown>;

function isObject(value: unknown): value is AnyRecord {
  return typeof value === 'object' && value !== null;
}

@Injectable()
export class DebugInterceptor implements NestInterceptor {
  constructor(private readonly configService: ConfigService) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<unknown>,
  ): Observable<unknown> {
    const debugEnabled = this.configService.get<boolean>(
      'debug.enabled',
      false,
    );
    if (!debugEnabled) {
      return next.handle();
    }

    const http = context.switchToHttp();
    const request = http.getRequest<{ query?: Record<string, unknown> }>();
    const q: Record<string, unknown> = request?.query ?? {};

    const debugParam = q['debug'];
    const requestWantsDebug =
      debugParam === '1' ||
      debugParam === 'true' ||
      debugParam === 1 ||
      debugParam === true;

    if (!requestWantsDebug) {
      return next.handle();
    }

    return debugSqlStorage.run({ enabled: true, queries: [] }, () =>
      next.handle().pipe(
        map((data: unknown) => {
          const store = debugSqlStorage.getStore();
          const debug = {
            sql: store?.queries ?? [],
          };

          if (isObject(data)) {
            return { ...data, debug };
          }

          return { data, debug };
        }),
      ),
    );
  }
}
