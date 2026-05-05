import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as argon from 'argon2';
import { IJwtPayload, ILocalStrategyUser, UserRole } from '../types';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RegisterDto } from '../dtos';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async validateUser(
    email: string,
    password: string,
  ): Promise<{
    id: string;
    role: UserRole;
  }> {
    const user = await this.usersService.findByEmailForAuth(email);
    if (!user) throw new UnauthorizedException('invalid credentials');
    const isPasswordMatch = await argon.verify(user.password, password);
    if (!isPasswordMatch)
      throw new UnauthorizedException('invalid credentials');
    return { id: user.id, role: user.role };
  }

  async register(dto: RegisterDto) {
    const user = await this.usersService.create(dto);
    const payload = this.generatePayload(user);
    const [accessTokens, refreshTokens] = await Promise.all([
      this.assignAccessTokens(payload),
      this.assignRefreshTokens(payload),
    ]);
    await this.usersService.updateRefreshTokens(user.id, refreshTokens);
    return { accessTokens, refreshTokens };
  }
  async login(user: ILocalStrategyUser) {
    const payload = this.generatePayload(user);
    const [accessTokens, refreshTokens] = await Promise.all([
      this.assignAccessTokens(payload),
      this.assignRefreshTokens(payload),
    ]);
    await this.usersService.updateRefreshTokens(user.id, refreshTokens);
    return { accessTokens, refreshTokens };
  }
  async logout(id: string) {
    return await this.usersService.updateRefreshTokens(id, null);
  }

  async refresh(id: string, refTokens: string) {
    const user = await this.usersService.getRefreshTokensById(id);
    if (!user || !user.refreshTokens)
      throw new UnauthorizedException('invalid credentials');
    const isMatch = await argon.verify(user.refreshTokens, refTokens);
    if (!isMatch) throw new UnauthorizedException('invalid credentials');
    const payload = this.generatePayload(user);
    const [accessTokens, refreshTokens] = await Promise.all([
      this.assignAccessTokens(payload),
      this.assignRefreshTokens(payload),
    ]);
    await this.usersService.updateRefreshTokens(user.id, refreshTokens);

    return { accessTokens, refreshTokens };
  }

  // helper functions
  async assignAccessTokens(payload: IJwtPayload) {
    return await this.jwtService.signAsync(payload, {
      secret: this.config.getOrThrow('JWT_ACCESS_SECRET'),
      expiresIn: this.config.getOrThrow('JWT_ACCESS_EXPIRY'),
    });
  }

  async assignRefreshTokens(payload: IJwtPayload) {
    return await this.jwtService.signAsync(payload, {
      secret: this.config.getOrThrow('JWT_REFRESH_SECRET'),
      expiresIn: this.config.getOrThrow('JWT_REFRESH_EXPIRY'),
    });
  }

  generatePayload(user: { id: string; role: UserRole }) {
    return { sub: user.id, role: user.role };
  }
}
