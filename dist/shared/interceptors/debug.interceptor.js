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
exports.DebugInterceptor = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const rxjs_1 = require("rxjs");
const debug_sql_storage_1 = require("./debug-sql.storage");
function isObject(value) {
    return typeof value === 'object' && value !== null;
}
let DebugInterceptor = class DebugInterceptor {
    constructor(configService) {
        this.configService = configService;
    }
    intercept(context, next) {
        const debugEnabled = this.configService.get('debug.enabled', false);
        if (!debugEnabled) {
            return next.handle();
        }
        const http = context.switchToHttp();
        const request = http.getRequest();
        const q = request?.query ?? {};
        const debugParam = q['debug'];
        const requestWantsDebug = debugParam === '1' ||
            debugParam === 'true' ||
            debugParam === 1 ||
            debugParam === true;
        if (!requestWantsDebug) {
            return next.handle();
        }
        return debug_sql_storage_1.debugSqlStorage.run({ enabled: true, queries: [] }, () => next.handle().pipe((0, rxjs_1.map)((data) => {
            const store = debug_sql_storage_1.debugSqlStorage.getStore();
            const debug = {
                sql: store?.queries ?? [],
            };
            if (isObject(data)) {
                return { ...data, debug };
            }
            return { data, debug };
        })));
    }
};
exports.DebugInterceptor = DebugInterceptor;
exports.DebugInterceptor = DebugInterceptor = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], DebugInterceptor);
//# sourceMappingURL=debug.interceptor.js.map