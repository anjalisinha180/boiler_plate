import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
export declare class AuthService {
    private readonly configService;
    private readonly jwtService;
    constructor(configService: ConfigService, jwtService: JwtService);
    validateLdapCredentials(username: string, password: string): void;
    issueTokens(subject: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
}
