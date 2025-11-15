import type { AuthProviderId } from '../../providers/types';

export interface UserSessionPayload {
  maxAge: number;
  provider: AuthProviderId;
  [key: string]: unknown;
}

export type ResponseHeaders = Record<string, string | string[]>;

export interface SessionStorage<TRequest, TResponse> {
  getSession(request: TRequest): Promise<string | null>;
  saveSession(
    response: TResponse | undefined,
    sessionData: string,
  ): Promise<{ response?: TResponse; headers?: ResponseHeaders }>;
  deleteSession(
    response: TResponse | undefined,
  ): Promise<{ response?: TResponse; headers?: ResponseHeaders }>;
}

export interface CookieOptions {
  maxAge?: number;
  path?: string;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: 'lax' | 'strict' | 'none';
}
