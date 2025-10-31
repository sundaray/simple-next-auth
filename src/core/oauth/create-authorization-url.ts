import { Result, ok } from 'neverthrow';

// ============================================
// TYPES
// ============================================

export interface AuthorizationUrlParams {
  clientId: string;
  redirectUri: string;
  state: string;
  codeChallenge: string;
  prompt: 'select_account' | 'consent' | 'none';
}

// ============================================
// CREATE AUTHORIZATION URL
// ============================================

const GOOGLE_AUTHORIZATION_ENDPOINT =
  'https://accounts.google.com/o/oauth2/v2/auth';

// 'openid' - Required for OpenID Connect
// 'email' - User's email address
// 'profile' - User's basic profile info
// @see https://developers.google.com/identity/protocols/oauth2/scopes
const SCOPES = ['openid', 'email', 'profile'];

export function createAuthorizationUrl(
  params: AuthorizationUrlParams,
): Result<string, never> {
  const { clientId, redirectUri, state, codeChallenge, prompt } = params;

  const url = new URL(GOOGLE_AUTHORIZATION_ENDPOINT);

  // Required OAuth 2.0 parameters
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('client_id', clientId);
  url.searchParams.set('redirect_uri', redirectUri);
  url.searchParams.set('state', state);

  // PKCE parameters
  url.searchParams.set('code_challenge', codeChallenge);
  url.searchParams.set('code_challenge_method', 'S256');

  // Scopes (user configurable)
  url.searchParams.set('scope', SCOPES.join(' '));

  // Prompt (user configurable)
  url.searchParams.set('prompt', prompt);

  return ok(url.toString());
}
