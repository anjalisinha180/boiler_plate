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
exports.NextAuthJwtStrategy = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const passport_1 = require("@nestjs/passport");
const passport_jwt_1 = require("passport-jwt");
let NextAuthJwtStrategy = class NextAuthJwtStrategy extends (0, passport_1.PassportStrategy)(passport_jwt_1.Strategy, 'nextauth-jwt') {
    constructor(configService) {
        super({
            jwtFromRequest: passport_jwt_1.ExtractJwt.fromExtractors([
                passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
                (req) => {
                    const header = req?.headers?.['x-nextauth-token'];
                    return typeof header === 'string' ? header : null;
                },
            ]),
            ignoreExpiration: false,
            secretOrKey: configService.getOrThrow('jwt.nextAuthSecret'),
        });
    }
    validate(payload) {
        if (!payload)
            throw new common_1.UnauthorizedException();
        return payload;
    }
};
exports.NextAuthJwtStrategy = NextAuthJwtStrategy;
exports.NextAuthJwtStrategy = NextAuthJwtStrategy = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], NextAuthJwtStrategy);
//# sourceMappingURL=nextauth-jwt.strategy.js.map