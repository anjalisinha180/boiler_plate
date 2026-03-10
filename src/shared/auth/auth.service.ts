import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { SignOptions } from 'jsonwebtoken';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  validateLdapCredentials(username: string, password: string): void {
    // Intentionally minimal boilerplate: you should implement your org’s LDAP lookup/bind rules here.
    // This method is called by the passport "ldap" strategy.
    const serverUri = this.configService.get<string>('ldap.serverUri');
    const bindDn = this.configService.get<string>('ldap.bindDn');
    const bindPassword = this.configService.get<string>('ldap.bindPassword');

    if (!serverUri || !bindDn || !bindPassword) {
      throw new UnauthorizedException('LDAP is not configured');
    }
    if (!username || !password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Placeholder success: replace with real LDAP bind + user verification.
  }

  async issueTokens(
    subject: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const secret = this.configService.get<string>('jwt.secret');
    const expiresIn = this.configService.get<string>('jwt.expiresIn');
    const refreshSecret = this.configService.get<string>('jwt.refreshSecret');
    const refreshExpiresIn = this.configService.get<string>(
      'jwt.refreshExpiresIn',
    );

    const payload = { sub: subject };

    const accessExpiresIn = (expiresIn ?? '1h') as SignOptions['expiresIn'];
    const refreshTokenExpiresIn = (refreshExpiresIn ??
      '7d') as SignOptions['expiresIn'];

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
}
