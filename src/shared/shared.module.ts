import { Module } from '@nestjs/common';

import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { DebugInterceptor } from './interceptors/debug.interceptor';
import { LoggingModule } from './logging/logging.module';

@Module({
  imports: [AuthModule, DatabaseModule, LoggingModule],
  exports: [AuthModule, DatabaseModule, LoggingModule, DebugInterceptor],
  providers: [DebugInterceptor],
})
export class SharedModule {}
