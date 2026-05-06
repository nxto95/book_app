import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { IAccessStrategyUser, PUBLIC_ROUTE_KEY } from '../../types';
import { UsersService } from '../../users/users.service';
import { Reflector } from '@nestjs/core';

@Injectable()
export class IsBlockedGuard implements CanActivate {
  constructor(
    private readonly usersService: UsersService,
    private readonly reflector: Reflector,
  ) {}
  async canActivate(context: ExecutionContext) {
    const isPublicRoute = this.reflector.getAllAndOverride<boolean>(
      PUBLIC_ROUTE_KEY,
      [context.getClass(), context.getHandler()],
    );
    if (isPublicRoute) return true;

    const request = context.switchToHttp().getRequest<Request>();
    const userFromRequest = request.user as IAccessStrategyUser;
    if (!userFromRequest) throw new UnauthorizedException();
    const blockedUser = await this.usersService.getBLockedUser(
      userFromRequest.id,
    );
    if (blockedUser)
      throw new UnauthorizedException('unauthorized or blocked user');
    return true;
  }
}
