import type { AuthProviderId } from '../../types';

export interface UserSessionPayload {
  createdAt: number;
  expiresAt: number;
  maxAge: number;
  provider: AuthProviderId;
  [key: string]: unknown;
}

export type ResponseHeaders = Record<string, string | string[]>;

export interface SessionStorage<TRequest, TResponse> {
  getUserSession(request: TRequest): Promise<string | null>;
  saveUserSession(
    response: TResponse,
    sessionData: string,
  ): Promise<{ response?: TResponse; headers?: ResponseHeaders }>;
  deleteUserSession(
    response: TResponse,
  ): Promise<{ response?: TResponse; headers?: ResponseHeaders }>;
}
