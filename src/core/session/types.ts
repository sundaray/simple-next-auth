import type { AuthProvider } from '../../types';

export interface UserSessionPayload {
  createdAt: number;
  expiresAt: number;
  maxAge: number;
  provider: AuthProvider[keyof AuthProvider];
  [key: string]: unknown;
}
