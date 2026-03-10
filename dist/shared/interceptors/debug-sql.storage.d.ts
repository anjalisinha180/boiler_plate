import { AsyncLocalStorage } from 'node:async_hooks';
export interface DebugSqlStore {
    enabled: boolean;
    queries: string[];
}
export declare const debugSqlStorage: AsyncLocalStorage<DebugSqlStore>;
