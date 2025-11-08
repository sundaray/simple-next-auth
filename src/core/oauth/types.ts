import type { AuthProviderId } from '../../types';

export type ProviderUser = Record<string, any>;

export interface OAuthStatePayload {
  state: string;
  codeVerifier: string;
  redirectTo?: `/${string}`;
  provider: AuthProviderId;
}

export interface OAuthSignInResult {
  userClaims: Record<string, any>;
  oauthState: OAuthStatePayload;
  tokens: Record<string, any>;
}
