import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { IAccessStrategyUser, IJwtPayload } from '../../types';

@Injectable()
export class AccessStrategy extends PassportStrategy(Strategy, 'access') {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_ACCESS_SECRET'),
    });
  }
  validate(payload: IJwtPayload): IAccessStrategyUser {
    return { id: payload.sub, role: payload.role };
  }
}
