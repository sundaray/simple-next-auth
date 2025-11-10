import type { AnyAuthProvider } from '../core/strategy';

export type AuthProviderId = 'google' | 'credentials';

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
      userInfo: Record<string, any>,
    ) => Promise<Record<string, unknown>>;
  };
}
