import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { IAccessStrategyUser, IJwtPayload } from '../../types';
import { UsersService } from '../../users/users.service';

@Injectable()
export class AccessStrategy extends PassportStrategy(Strategy, 'jwt-access') {
  constructor(
    config: ConfigService,
    private readonly usersServices: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_ACCESS_SECRET'),
    });
  }
  async validate(payload: IJwtPayload): Promise<IAccessStrategyUser> {
    const user = await this.usersServices.getUserById(payload.sub);
    if (!user || user.isBlocked)
      throw new UnauthorizedException('user blocked or not valid');
    return { id: payload.sub, role: payload.role };
  }
}
