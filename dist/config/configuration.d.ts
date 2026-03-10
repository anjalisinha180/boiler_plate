import * as Joi from 'joi';
export interface MariaDBDatabaseConfig {
    host: string;
    port: number;
    username: string;
    password: string;
    connectionLimit: number;
    queueLimit: number;
    reconnectInterval: number;
    maxReconnectAttempts: number;
    ssl: boolean;
    dateStrings: boolean;
    databases: {
        rsp: string;
        demandVersion: string;
    };
}
export interface JwtConfig {
    secret: string;
    expiresIn: string;
    refreshSecret: string;
    refreshExpiresIn: string;
    nextAuthSecret: string;
}
export interface SwaggerConfig {
    title: string;
    description: string;
    version: string;
    path: string;
    enabled: boolean;
}
export interface DebugConfig {
    enabled: boolean;
}
export interface LdapConfig {
    serverUri: string;
    bindDn: string;
    bindPassword: string;
}
export interface AppConfig {
    nodeEnv: string;
    port: number;
    apiPrefix: string;
    appName: string;
    appVersion: string;
    mariadb: MariaDBDatabaseConfig;
    jwt: JwtConfig;
    swagger: SwaggerConfig;
    ldap: LdapConfig;
    debug: DebugConfig;
}
export declare const configurationSchema: Joi.ObjectSchema<any>;
export declare const configuration: () => AppConfig;
