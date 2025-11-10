import type { SessionStorage, ResponseHeaders } from './types';
import type { AuthConfig } from '../../types';
import type { CookieOptions } from './types';

interface BuildSetCookieHeaderStringParams {
  cookieName: string;
  cookieValue: string;
  cookieOptions: CookieOptions;
}

/**
 * Generic base class for cookie-based session storage.
 * Not coupled to any specific session type.
 */
export abstract class CookieSessionStorage<TRequest, TResponse>
  implements SessionStorage<TRequest, TResponse>
{
  protected config: AuthConfig;
  protected cookieName: string;
  protected cookieOptions: CookieOptions;

  constructor(
    config: AuthConfig,
    cookieName: string,
    cookieOptions: CookieOptions,
  ) {
    this.config = config;
    this.cookieName = cookieName;
    this.cookieOptions = cookieOptions;
  }

  /**
   * Build a Set-Cookie header string
   */
  protected buildSetCookieHeaderString({
    cookieName,
    cookieValue,
    cookieOptions,
  }: BuildSetCookieHeaderStringParams) {
    const parts = [`${cookieName}=${encodeURIComponent(cookieValue)}`];

    if (cookieOptions.maxAge) {
      parts.push(`Max-Age=${cookieOptions.maxAge}`);
    }

    if (cookieOptions.path) {
      parts.push(`Path=${cookieOptions.path}`);
    }

    if (cookieOptions.httpOnly) {
      parts.push('HttpOnly');
    }

    if (cookieOptions.secure) {
      parts.push('Secure');
    }

    if (cookieOptions.sameSite) {
      parts.push(`SameSite=${cookieOptions.sameSite}`);
    }

    return parts.join('; ');
  }

  /**
   * Override this to mutate response directly
   * Default: returns void, causing headers to be returned instead
   */
  protected async applyHeaders(
    _response: TResponse,
    _headers: ResponseHeaders,
  ): Promise<{ response: TResponse } | void> {}

  /**
   * Abstract: Must be implemented by framework-specific class
   */
  abstract getSession(request: TRequest): Promise<string | null>;

  /**
   * Save session data
   */
  async saveSession(
    response: TResponse,
    sessionData: string,
  ): Promise<{ response?: TResponse; headers?: ResponseHeaders }> {
    const setCookieHeaderString = this.buildSetCookieHeaderString({
      cookieName: this.cookieName,
      cookieValue: sessionData,
      cookieOptions: this.cookieOptions,
    });

    const mutated = await this.applyHeaders(response, {
      'Set-Cookie': setCookieHeaderString,
    });

    return mutated ?? { headers: { 'Set-Cookie': setCookieHeaderString } };
  }

  /**
   * Delete session data
   */
  async deleteSession(
    response: TResponse,
  ): Promise<{ response?: TResponse; headers?: ResponseHeaders }> {
    const setCookieHeaderString = this.buildSetCookieHeaderString({
      cookieName: this.cookieName,
      cookieValue: '',
      cookieOptions: {
        ...this.cookieOptions,
        maxAge: 0,
      },
    });

    const mutated = await this.applyHeaders(response, {
      'Set-Cookie': setCookieHeaderString,
    });

    return { headers: { 'Set-Cookie': setCookieHeaderString } };
  }
}
