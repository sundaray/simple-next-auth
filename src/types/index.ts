export interface OAuthStatePayload {
  state: string;
  codeVerifier: string;
  redirectTo?: `/${string}`;
  provider: string;
}
