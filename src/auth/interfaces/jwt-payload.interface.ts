import { Role } from '@prisma/client';

export class JwtPayload {
  sub: string;
  email: string;
  role: Role;
  tenantId: string;
}

export class AuthenticatedUser {
  id: string;
  email: string;
  role: Role;
  tenantId: string;
}
