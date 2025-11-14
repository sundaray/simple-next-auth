import type { AnyAuthProvider } from '../providers/types';

export type AuthProviderId = 'google' | 'credentials';

export interface SignInOptions {
  redirectTo?: `/${string}`;
}

export interface AuthConfig {
  baseUrl: string;
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
