import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IAccessStrategyUser, USER_ROLE_KEY, UserRole } from '../../types';
import { Request } from 'express';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  canActivate(context: ExecutionContext) {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      USER_ROLE_KEY,
      [context.getClass(), context.getHandler()],
    );
    if (!requiredRoles || requiredRoles.length === 0) return true;

    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user as IAccessStrategyUser;
    if (!user || !user.role) return false;
    return requiredRoles.some((role) => user.role === role);
  }
}
