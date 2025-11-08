import type { AuthProviderId } from '../../types';

export interface UserSessionPayload {
  createdAt: number;
  expiresAt: number;
  maxAge: number;
  provider: AuthProviderId[keyof AuthProviderId];
  [key: string]: unknown;
}
