import { Inject, Injectable, LoggerService } from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import type { Logger } from 'winston';

@Injectable()
export class LoginAuditLoggerService {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService & Logger,
  ) {}

  loginSuccess(payload: Record<string, unknown>): void {
    this.logger.info('auth.login.success', payload);
  }

  loginFailure(payload: Record<string, unknown>): void {
    this.logger.warn('auth.login.failure', payload);
  }
}
