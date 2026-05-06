export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

export interface IJwtPayload {
  sub: string;
  role: UserRole;
}

export interface IAccessStrategyUser {
  id: string;
  role: UserRole;
}

export interface ILocalStrategyUser extends IAccessStrategyUser {}

export interface IRefreshStrategyUser {
  id: string;
  role: UserRole;
  refreshTokens: string;
}

export const USER_ROLE_KEY = 'user_role';
export const PUBLIC_ROUTE_KEY = 'public_route';
