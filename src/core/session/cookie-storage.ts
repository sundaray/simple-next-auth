import type { SessionStorage, ResponseHeaders } from './types';
import { COOKIE_NAMES } from '../constants';
import type { AuthConfig } from '../../types';

export interface CookieOptions {
  maxAge?: number;
  path?: string;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: 'lax' | 'strict' | 'none';
}

export abstract class CookieSessionStorage<TRequest, TResponse>
  implements SessionStorage<TRequest, TResponse>
{
  protected config: AuthConfig;

  constructor(config: AuthConfig) {
    this.config = config;
  }

  protected buildSetCookie(
    name: string,
    value: string,
    options: CookieOptions,
  ) {
    const parts = [`${name}=${encodeURIComponent(value)}`];
    parts.push(`Max-Age=${options.maxAge}`);
    parts.push(`Path=${options.path}`);
    parts.push('HttpOnly');
    parts.push('Secure');
    parts.push(`SameSite=${options.sameSite}`);

    return parts.join('; ');
  }

  abstract getUserSession(request: TRequest): Promise<string | null>;

  async saveUserSession(
    response: TResponse,
    sessionData: string,
  ): Promise<{ response?: TResponse; headers?: ResponseHeaders }> {
    const cookie = this.buildSetCookie(COOKIE_NAMES.USER_SESSION, sessionData, {
      maxAge: this.config.session.maxAge,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    return { headers: { 'Set-Cookie': cookie } };
  }

  async deleteUserSession(
    response: TResponse,
  ): Promise<{ response?: TResponse; headers?: ResponseHeaders }> {
    const cookie = this.buildSetCookie(COOKIE_NAMES.USER_SESSION, '', {
      maxAge: 0,
      path: '/',
    });

    return { headers: { 'Set-Cookie': cookie } };
  }
}
