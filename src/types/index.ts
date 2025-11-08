import type { AnyAuthProvider } from '../core/strategy';
import type { UserSessionPayload } from '../core/session';

export type AuthProviderId = 'google' | 'credentials';

export interface CookieOptions {
  maxAge: number;
}

export interface FrameworkAdapter {
  setCookie(name: string, value: string, options: CookieOptions): Promise<void>;

  getCookie(name: string): Promise<string | undefined>;

  deleteCookie(name: string): Promise<void>;

  redirect(url: string, type?: string): void;
}

export interface SignInOptions {
  redirectTo?: `/${string}`;
}

export interface AuthConfig {
  session: {
    secret: string;
    maxAge: number;
  };
  providers: AnyAuthProvider[];
  callbacks: {
    onSignIn: (
      userInfo: UserSessionPayload,
    ) => Promise<Record<string, unknown>>;
  };
}
