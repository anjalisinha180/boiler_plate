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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
let AuthService = class AuthService {
    constructor(configService, jwtService) {
        this.configService = configService;
        this.jwtService = jwtService;
    }
    validateLdapCredentials(username, password) {
        const serverUri = this.configService.get('ldap.serverUri');
        const bindDn = this.configService.get('ldap.bindDn');
        const bindPassword = this.configService.get('ldap.bindPassword');
        if (!serverUri || !bindDn || !bindPassword) {
            throw new common_1.UnauthorizedException('LDAP is not configured');
        }
        if (!username || !password) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
    }
    async issueTokens(subject) {
        const secret = this.configService.get('jwt.secret');
        const expiresIn = this.configService.get('jwt.expiresIn');
        const refreshSecret = this.configService.get('jwt.refreshSecret');
        const refreshExpiresIn = this.configService.get('jwt.refreshExpiresIn');
        const payload = { sub: subject };
        const accessExpiresIn = (expiresIn ?? '1h');
        const refreshTokenExpiresIn = (refreshExpiresIn ??
            '7d');
        const accessToken = await this.jwtService.signAsync(payload, {
            secret,
            expiresIn: accessExpiresIn,
        });
        const refreshToken = await this.jwtService.signAsync(payload, {
            secret: refreshSecret,
            expiresIn: refreshTokenExpiresIn,
        });
        return { accessToken, refreshToken };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map