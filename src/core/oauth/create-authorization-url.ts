import { Result, ok } from 'neverthrow';

// ============================================
// TYPES
// ============================================

export interface AuthorizationUrlParams {
  clientId: string;
  redirectUri: string;
  state: string;
  codeChallenge: string;
  scopes: string[];
  prompt: 'select_account' | 'consent' | 'none';
}

// ============================================
// CREATE AUTHORIZATION URL
// ============================================

const GOOGLE_AUTHORIZATION_ENDPOINT =
  'https://accounts.google.com/o/oauth2/v2/auth';

/**
 * Creates a Google OAuth 2.0 authorization URL with PKCE.
 *
 * This URL is where users are redirected to sign in with their Google account.
 */
export function createAuthorizationUrl(
  params: AuthorizationUrlParams,
): Result<string, never> {
  const { clientId, redirectUri, state, codeChallenge, scopes, prompt } =
    params;

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
  url.searchParams.set('scope', scopes.join(' '));

  // Prompt (user configurable)
  url.searchParams.set('prompt', prompt);

  return ok(url.toString());
}
