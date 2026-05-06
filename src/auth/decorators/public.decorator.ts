import { SetMetadata } from '@nestjs/common';
import { PUBLIC_ROUTE_KEY } from '../../types';

export function PublicRoute() {
  return SetMetadata(PUBLIC_ROUTE_KEY, true);
}
