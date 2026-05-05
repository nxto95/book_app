import { SetMetadata } from '@nestjs/common';
import { USER_ROLE_KEY, UserRole } from '../../types';

export function URole(...roles: UserRole[]) {
  return SetMetadata(USER_ROLE_KEY, roles);
}
