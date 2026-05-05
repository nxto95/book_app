import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from '../dtos';
import { type Request } from 'express';
import { AccessGuard, LocalGuard, RefreshGuard } from './guards';
import type {
  IAccessStrategyUser,
  ILocalStrategyUser,
  IRefreshStrategyUser,
} from '../types';
import { CurrentUser } from './decorators';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return await this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalGuard)
  async login(@CurrentUser() user: ILocalStrategyUser) {
    return await this.authService.login(user);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AccessGuard)
  async logout(@CurrentUser() user: IAccessStrategyUser) {
    return await this.authService.logout(user.id);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RefreshGuard)
  async refresh(@Req() req: Request) {
    const { id, refreshTokens } = req.user as IRefreshStrategyUser;
    return await this.authService.refresh(id, refreshTokens);
  }
}
