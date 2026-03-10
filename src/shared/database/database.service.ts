import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type {
  Pool,
  PoolConnection,
  PoolOptions,
  RowDataPacket,
} from 'mysql2/promise';
import { createPool } from 'mysql2/promise';

import type { MariaDBDatabaseConfig } from '@/config/configuration';
import { debugSqlStorage } from '@/shared/interceptors/debug-sql.storage';

type QueryResult<T> = T extends any[] ? T : T[];

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private rspPool!: Pool;
  private demandVersionPool!: Pool;
  private healthTimer: NodeJS.Timeout | null = null;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit(): void {
    const cfg = this.configService.get<MariaDBDatabaseConfig>('mariadb');
    if (!cfg) {
      throw new Error('Missing mariadb configuration');
    }

    this.rspPool = this.createNamedPool(cfg, cfg.databases.rsp);
    this.demandVersionPool = this.createNamedPool(
      cfg,
      cfg.databases.demandVersion,
    );

    this.healthTimer = setInterval(() => {
      void this.checkHealth().catch(() => {
        // health check errors are handled by retry logic on real queries
      });
    }, 30_000);
    this.healthTimer.unref?.();
  }

  async onModuleDestroy(): Promise<void> {
    if (this.healthTimer) clearInterval(this.healthTimer);
    await Promise.allSettled([
      this.rspPool?.end(),
      this.demandVersionPool?.end(),
    ]);
  }

  private createNamedPool(cfg: MariaDBDatabaseConfig, database: string): Pool {
    const options: PoolOptions = {
      host: cfg.host,
      port: cfg.port,
      user: cfg.username,
      password: cfg.password,
      database,
      waitForConnections: true,
      connectionLimit: cfg.connectionLimit,
      queueLimit: cfg.queueLimit,
      dateStrings: cfg.dateStrings,
      ssl: cfg.ssl ? { rejectUnauthorized: false } : undefined,
    };

    return createPool(options);
  }

  private captureSql(sql: string, params?: unknown): void {
    const store = debugSqlStorage.getStore();
    if (!store?.enabled) return;

    const rendered =
      params === undefined ? sql : `${sql} :: ${JSON.stringify(params)}`;
    store.queries.push(rendered);
  }

  private async withRetry<T>(
    fn: () => Promise<T>,
    attempts?: number,
    intervalMs?: number,
  ): Promise<T> {
    const maxAttempts =
      attempts ??
      this.configService.get<number>('mariadb.maxReconnectAttempts', 3);
    const delay =
      intervalMs ??
      this.configService.get<number>('mariadb.reconnectInterval', 1000);

    let lastErr: unknown;
    for (let i = 0; i < maxAttempts; i++) {
      try {
        return await fn();
      } catch (err) {
        lastErr = err;
        if (i === maxAttempts - 1) break;
        await new Promise(res => setTimeout(res, delay));
      }
    }
    throw lastErr;
  }

  async executeRspQuery<T extends RowDataPacket[] = RowDataPacket[]>(
    sql: string,
    params?: unknown[],
  ): Promise<QueryResult<T>> {
    this.captureSql(sql, params);
    return this.withRetry(async () => {
      const [rows] = await this.rspPool.query<T>(sql, params);
      return rows as QueryResult<T>;
    });
  }

  async executeDemandVersionQuery<T extends RowDataPacket[] = RowDataPacket[]>(
    sql: string,
    params?: unknown[],
  ): Promise<QueryResult<T>> {
    this.captureSql(sql, params);
    return this.withRetry(async () => {
      const [rows] = await this.demandVersionPool.query<T>(sql, params);
      return rows as QueryResult<T>;
    });
  }

  async executeTransaction<T>(
    database: 'rsp' | 'demandVersion',
    fn: (conn: PoolConnection) => Promise<T>,
  ): Promise<T> {
    const pool = database === 'rsp' ? this.rspPool : this.demandVersionPool;
    return this.withRetry(async () => {
      const conn = await pool.getConnection();
      try {
        await conn.beginTransaction();
        const result = await fn(conn);
        await conn.commit();
        return result;
      } catch (err) {
        await conn.rollback().catch(() => undefined);
        throw err;
      } finally {
        conn.release();
      }
    });
  }

  async checkHealth(): Promise<{ rsp: boolean; demandVersion: boolean }> {
    const [rspOk, dvOk] = await Promise.all([
      this.ping(this.rspPool),
      this.ping(this.demandVersionPool),
    ]);
    return { rsp: rspOk, demandVersion: dvOk };
  }

  private async ping(pool: Pool): Promise<boolean> {
    try {
      await pool.query('SELECT 1');
      return true;
    } catch {
      return false;
    }
  }

  getConnectionStats(): {
    rsp: { poolSize?: number };
    demandVersion: { poolSize?: number };
  } {
    const anyRsp = this.rspPool as unknown as { _allConnections?: unknown[] };
    const anyDv = this.demandVersionPool as unknown as {
      _allConnections?: unknown[];
    };
    return {
      rsp: { poolSize: anyRsp?._allConnections?.length },
      demandVersion: { poolSize: anyDv?._allConnections?.length },
    };
  }
}
