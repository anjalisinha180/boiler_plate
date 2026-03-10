import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';

import { AuthService } from '../auth.service';

@Injectable()
export class LdapStrategy extends PassportStrategy(Strategy, 'ldap') {
  constructor(private readonly authService: AuthService) {
    super();
  }

  validate(req: { body?: { username?: string; password?: string } }): {
    username: string;
  } {
    const username = req.body?.username;
    const password = req.body?.password;

    if (!username || !password) {
      throw new UnauthorizedException('Missing username/password');
    }

    this.authService.validateLdapCredentials(username, password);
    return { username };
  }
}
