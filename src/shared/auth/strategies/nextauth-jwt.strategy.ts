import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class NextAuthJwtStrategy extends PassportStrategy(
  Strategy,
  'nextauth-jwt',
) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        (req: { headers?: Record<string, unknown> } | undefined): string | null => {
          const header = req?.headers?.['x-nextauth-token'];
          return typeof header === 'string' ? header : null;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('jwt.nextAuthSecret'),
    });
  }

  validate(payload: any): any {
    if (!payload) throw new UnauthorizedException();
    return payload;
  }
}
