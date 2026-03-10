import { LoggerService } from '@nestjs/common';
import type { Logger } from 'winston';
export declare class LoginAuditLoggerService {
    private readonly logger;
    constructor(logger: LoggerService & Logger);
    loginSuccess(payload: Record<string, unknown>): void;
    loginFailure(payload: Record<string, unknown>): void;
}
