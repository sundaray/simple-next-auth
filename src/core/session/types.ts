import type { AuthProviderId } from '../../types';

export interface UserSessionPayload {
  createdAt: number;
  expiresAt: number;
  maxAge: number;
  provider: AuthProviderId;
  [key: string]: unknown;
}
