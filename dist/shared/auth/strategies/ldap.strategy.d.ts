import { Strategy } from 'passport-custom';
import { AuthService } from '../auth.service';
declare const LdapStrategy_base: new () => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class LdapStrategy extends LdapStrategy_base {
    private readonly authService;
    constructor(authService: AuthService);
    validate(req: {
        body?: {
            username?: string;
            password?: string;
        };
    }): {
        username: string;
    };
}
export {};
