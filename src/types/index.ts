import type { AnyAuthProvider } from '../providers/types';

export type AuthProviderId = 'google' | 'credential';

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
}
