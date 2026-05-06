import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { IJwtPayload, IRefreshStrategyUser } from '../../types';
import { Request } from 'express';

@Injectable()
export class RefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_REFRESH_SECRET'),
      passReqToCallback: true,
    });
  }

  validate(req: Request, payload: IJwtPayload): IRefreshStrategyUser {
    const refreshTokens = req
      .get('authorization')
      ?.replace(/^bearer/gi, '')
      .trim();

    if (!refreshTokens) throw new UnauthorizedException('invalid credentials');
    return {
      id: payload.sub,
      role: payload.role,
      refreshTokens,
    };
  }
}
