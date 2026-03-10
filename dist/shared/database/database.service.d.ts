import { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { PoolConnection, RowDataPacket } from 'mysql2/promise';
type QueryResult<T> = T extends any[] ? T : T[];
export declare class DatabaseService implements OnModuleInit, OnModuleDestroy {
    private readonly configService;
    private rspPool;
    private demandVersionPool;
    private healthTimer;
    constructor(configService: ConfigService);
    onModuleInit(): void;
    onModuleDestroy(): Promise<void>;
    private createNamedPool;
    private captureSql;
    private withRetry;
    executeRspQuery<T extends RowDataPacket[] = RowDataPacket[]>(sql: string, params?: unknown[]): Promise<QueryResult<T>>;
    executeDemandVersionQuery<T extends RowDataPacket[] = RowDataPacket[]>(sql: string, params?: unknown[]): Promise<QueryResult<T>>;
    executeTransaction<T>(database: 'rsp' | 'demandVersion', fn: (conn: PoolConnection) => Promise<T>): Promise<T>;
    checkHealth(): Promise<{
        rsp: boolean;
        demandVersion: boolean;
    }>;
    private ping;
    getConnectionStats(): {
        rsp: {
            poolSize?: number;
        };
        demandVersion: {
            poolSize?: number;
        };
    };
}
export {};
