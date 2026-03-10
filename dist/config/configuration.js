"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.configuration = exports.configurationSchema = void 0;
const Joi = __importStar(require("joi"));
exports.configurationSchema = Joi.object({
    NODE_ENV: Joi.string()
        .valid('development', 'staging', 'production', 'qa', 'test')
        .default('development'),
    PORT: Joi.number().default(3000),
    API_PREFIX: Joi.string().default('api/v1'),
    APP_NAME: Joi.string().required(),
    APP_VERSION: Joi.string().required(),
    MARIADB_HOST: Joi.string().default('localhost'),
    MARIADB_PORT: Joi.number().default(3306),
    MARIADB_USERNAME: Joi.string().default('root'),
    MARIADB_PASSWORD: Joi.string().default('root'),
    MARIADB_CONNECTION_LIMIT: Joi.number().default(10),
    MARIADB_QUEUE_LIMIT: Joi.number().default(0),
    MARIADB_RECONNECT_INTERVAL: Joi.number().default(1000),
    MARIADB_MAX_RECONNECT_ATTEMPTS: Joi.number().default(3),
    MARIADB_SSL: Joi.boolean().default(false),
    MARIADB_RSP_DATABASE: Joi.string().default('app_db'),
    MARIADB_DEMAND_VERSION_DATABASE: Joi.string().default('app_db_2'),
    JWT_SECRET: Joi.string().min(32).required(),
    JWT_EXPIRES_IN: Joi.string().default('1h'),
    JWT_REFRESH_SECRET: Joi.string().min(32).required(),
    JWT_REFRESH_EXPIRES_IN: Joi.string().default('7d'),
    NEXTAUTH_SECRET: Joi.string().min(32).required(),
    SWAGGER_TITLE: Joi.string().required(),
    SWAGGER_DESCRIPTION: Joi.string().required(),
    SWAGGER_VERSION: Joi.string().required(),
    SWAGGER_PATH: Joi.string().default('api/docs'),
    SWAGGER_ENABLED: Joi.boolean().default(true),
    LDAP_SERVER_URI: Joi.string().required(),
    LDAP_BIND_DN: Joi.string().required(),
    LDAP_BIND_PASSWORD: Joi.string().required(),
    DEBUG_ENABLED: Joi.boolean().default(false),
});
const configuration = () => ({
    nodeEnv: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '3000', 10),
    apiPrefix: process.env.API_PREFIX || 'api/v1',
    appName: process.env.APP_NAME || 'My API',
    appVersion: process.env.APP_VERSION || '0.1.0',
    mariadb: {
        host: process.env.MARIADB_HOST || 'localhost',
        port: parseInt(process.env.MARIADB_PORT || '3306', 10),
        username: process.env.MARIADB_USERNAME || 'root',
        password: process.env.MARIADB_PASSWORD || 'root',
        connectionLimit: parseInt(process.env.MARIADB_CONNECTION_LIMIT || '10', 10),
        queueLimit: parseInt(process.env.MARIADB_QUEUE_LIMIT || '0', 10),
        reconnectInterval: parseInt(process.env.MARIADB_RECONNECT_INTERVAL || '1000', 10),
        maxReconnectAttempts: parseInt(process.env.MARIADB_MAX_RECONNECT_ATTEMPTS || '3', 10),
        ssl: process.env.MARIADB_SSL === 'true',
        dateStrings: true,
        databases: {
            rsp: process.env.MARIADB_RSP_DATABASE || 'app_db',
            demandVersion: process.env.MARIADB_DEMAND_VERSION_DATABASE || 'app_db_2',
        },
    },
    jwt: {
        secret: process.env.JWT_SECRET || '',
        expiresIn: process.env.JWT_EXPIRES_IN || '1h',
        refreshSecret: process.env.JWT_REFRESH_SECRET || '',
        refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
        nextAuthSecret: process.env.NEXTAUTH_SECRET || '',
    },
    swagger: {
        title: process.env.SWAGGER_TITLE || 'API Documentation',
        description: process.env.SWAGGER_DESCRIPTION || 'API Documentation',
        version: process.env.SWAGGER_VERSION || '1.0.0',
        path: process.env.SWAGGER_PATH || 'api/docs',
        enabled: process.env.SWAGGER_ENABLED !== 'false',
    },
    ldap: {
        serverUri: process.env.LDAP_SERVER_URI || '',
        bindDn: process.env.LDAP_BIND_DN || '',
        bindPassword: process.env.LDAP_BIND_PASSWORD || '',
    },
    debug: {
        enabled: process.env.DEBUG_ENABLED === 'true',
    },
});
exports.configuration = configuration;
//# sourceMappingURL=configuration.js.map