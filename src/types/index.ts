export interface AuthProvider {
  provider: 'google' | 'github' | 'credentials';
}

export interface UserSessionPayload {
  createdAt: number;
  expiresAt: number;
  maxAge: number;
  provider: AuthProvider[keyof AuthProvider];
  [key: string]: unknown;
}

/**
 * Payload claims from a Google ID Token.
 * Based on: https://developers.google.com/identity/openid-connect/openid-connect#an-id-tokens-payload
 */

export interface CookieOptions {
  maxAge: number;
}

export interface FrameworkAdapter {
  setCookie(name: string, value: string, options: CookieOptions): Promise<void>;

  getCookie(name: string): Promise<string | undefined>;

  deleteCookie(name: string): Promise<void>;

  redirect(url: string, type?: string): void;
}
