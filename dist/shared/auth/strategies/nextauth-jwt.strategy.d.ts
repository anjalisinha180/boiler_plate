import { ConfigService } from '@nestjs/config';
import { Strategy } from 'passport-jwt';
declare const NextAuthJwtStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithRequest] | [opt: import("passport-jwt").StrategyOptionsWithoutRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class NextAuthJwtStrategy extends NextAuthJwtStrategy_base {
    constructor(configService: ConfigService);
    validate(payload: any): any;
}
export {};
