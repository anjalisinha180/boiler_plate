"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const promise_1 = require("mysql2/promise");
const debug_sql_storage_1 = require("../interceptors/debug-sql.storage");
let DatabaseService = class DatabaseService {
    constructor(configService) {
        this.configService = configService;
        this.healthTimer = null;
    }
    onModuleInit() {
        const cfg = this.configService.get('mariadb');
        if (!cfg) {
            throw new Error('Missing mariadb configuration');
        }
        this.rspPool = this.createNamedPool(cfg, cfg.databases.rsp);
        this.demandVersionPool = this.createNamedPool(cfg, cfg.databases.demandVersion);
        this.healthTimer = setInterval(() => {
            void this.checkHealth().catch(() => {
            });
        }, 30_000);
        this.healthTimer.unref?.();
    }
    async onModuleDestroy() {
        if (this.healthTimer)
            clearInterval(this.healthTimer);
        await Promise.allSettled([
            this.rspPool?.end(),
            this.demandVersionPool?.end(),
        ]);
    }
    createNamedPool(cfg, database) {
        const options = {
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
        return (0, promise_1.createPool)(options);
    }
    captureSql(sql, params) {
        const store = debug_sql_storage_1.debugSqlStorage.getStore();
        if (!store?.enabled)
            return;
        const rendered = params === undefined ? sql : `${sql} :: ${JSON.stringify(params)}`;
        store.queries.push(rendered);
    }
    async withRetry(fn, attempts, intervalMs) {
        const maxAttempts = attempts ??
            this.configService.get('mariadb.maxReconnectAttempts', 3);
        const delay = intervalMs ??
            this.configService.get('mariadb.reconnectInterval', 1000);
        let lastErr;
        for (let i = 0; i < maxAttempts; i++) {
            try {
                return await fn();
            }
            catch (err) {
                lastErr = err;
                if (i === maxAttempts - 1)
                    break;
                await new Promise(res => setTimeout(res, delay));
            }
        }
        throw lastErr;
    }
    async executeRspQuery(sql, params) {
        this.captureSql(sql, params);
        return this.withRetry(async () => {
            const [rows] = await this.rspPool.query(sql, params);
            return rows;
        });
    }
    async executeDemandVersionQuery(sql, params) {
        this.captureSql(sql, params);
        return this.withRetry(async () => {
            const [rows] = await this.demandVersionPool.query(sql, params);
            return rows;
        });
    }
    async executeTransaction(database, fn) {
        const pool = database === 'rsp' ? this.rspPool : this.demandVersionPool;
        return this.withRetry(async () => {
            const conn = await pool.getConnection();
            try {
                await conn.beginTransaction();
                const result = await fn(conn);
                await conn.commit();
                return result;
            }
            catch (err) {
                await conn.rollback().catch(() => undefined);
                throw err;
            }
            finally {
                conn.release();
            }
        });
    }
    async checkHealth() {
        const [rspOk, dvOk] = await Promise.all([
            this.ping(this.rspPool),
            this.ping(this.demandVersionPool),
        ]);
        return { rsp: rspOk, demandVersion: dvOk };
    }
    async ping(pool) {
        try {
            await pool.query('SELECT 1');
            return true;
        }
        catch {
            return false;
        }
    }
    getConnectionStats() {
        const anyRsp = this.rspPool;
        const anyDv = this.demandVersionPool;
        return {
            rsp: { poolSize: anyRsp?._allConnections?.length },
            demandVersion: { poolSize: anyDv?._allConnections?.length },
        };
    }
};
exports.DatabaseService = DatabaseService;
exports.DatabaseService = DatabaseService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], DatabaseService);
//# sourceMappingURL=database.service.js.map