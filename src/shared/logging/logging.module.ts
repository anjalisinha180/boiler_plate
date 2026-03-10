import { Module } from '@nestjs/common';

import { LoginAuditLoggerService } from './login-audit-logger.service';

@Module({
  providers: [LoginAuditLoggerService],
  exports: [LoginAuditLoggerService],
})
export class LoggingModule {}
