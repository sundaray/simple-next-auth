export interface AuthProvider {
  provider: 'google' | 'github' | 'credentials';
}

export type ProviderUser = Record<string, any>;

export interface OAuthStatePayload {
  state: string;
  codeVerifier: string;
  redirectTo?: `/${string}`;
  provider: AuthProvider[keyof AuthProvider];
}

export interface OAuthSignInResult {
  userClaims: Record<string, any>;
  oauthState: OAuthStatePayload;
  tokens: Record<string, any>;
}
