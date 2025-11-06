export interface OAuthStatePayload {
  state: string;
  codeVerifier: string;
  redirectTo?: `/${string}`;
  provider: string;
}

export interface AuthProvider {
  provider: 'google' | 'github' | 'credentials';
}

export interface UserSessionPayload {
  createdAt: number;
  expiresAt: number;
  maxAge: number;
  provider: AuthProvider;
  [key: string]: unknown;
}

/**
 * Payload claims from a Google ID Token.
 * Based on: https://developers.google.com/identity/openid-connect/openid-connect#an-id-tokens-payload
 */
export interface GoogleIdTokenPayload {
  aud: string;
  exp: number;
  iat: number;
  iss: string;
  sub: string;
  email: string;
  at_hash?: string;
  azp?: string;
  email_verified?: boolean;
  name?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
  locale?: string;
  profile?: string;
}

export interface GoogleTokenResponse {
  access_token: string;
  expires_in: number;
  id_token: string;
  scope: string;
  token_type: string;
  refresh_token?: string;
}
