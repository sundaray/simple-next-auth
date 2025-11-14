import { Result, ok, err } from 'neverthrow';
import type { OAuthProvider } from '../../providers/types';
import type { GoogleProviderConfig } from './types';
import type { OAuthStatePayload, UserClaims } from '../../core/oauth/types';

import { decodeGoogleIdToken } from './decode-google-id-token';
import { exchangeAuthorizationCodeForTokens } from './exchange-authorization-code-for-tokens';

import {
  MissingAuthorizationCodeError,
  MissingStateError,
  StateMismatchError,
} from '../../core/oauth/errors';

import { AuthError } from '../../core/errors';

// --------------------------------------------
//
// Google provider
//
// --------------------------------------------
export class GoogleProvider implements OAuthProvider {
  id = 'google' as const;
  type = 'oauth' as const;
  config: GoogleProviderConfig;

  constructor(config: GoogleProviderConfig) {
    this.config = config;
  }

  // --------------------------------------------
  // Get Authorization URL
  // --------------------------------------------

  getAuthorizationUrl(params: {
    state: string;
    codeChallenge: string;
    prompt?: string;
  }): Result<string, AuthError> {
    const { state, codeChallenge, prompt } = params;
    const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');

    url.searchParams.set('response_type', 'code');
    url.searchParams.set('client_id', this.config.clientId);
    url.searchParams.set('redirect_uri', this.config.redirectUri);
    url.searchParams.set('state', state);
    url.searchParams.set('code_challenge', codeChallenge);
    url.searchParams.set('code_challenge_method', 'S256');
    url.searchParams.set('scope', 'openid email profile');
    url.searchParams.set('prompt', prompt || 'select_account');

    return ok(url.toString());
  }

  // --------------------------------------------
  // Handle Callback
  // --------------------------------------------
  async handleCallback(
    request: Request,
    oauthStatePayload: OAuthStatePayload,
  ): Promise<Result<UserClaims, AuthError>> {
    const url = new URL(request.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');

    if (!code) {
      return err(new MissingAuthorizationCodeError());
    }

    if (!state) {
      return err(new MissingStateError());
    }

    // Compare the state stored in cookie with state stored in URL
    if (oauthStatePayload.state !== state) {
      return err(new StateMismatchError());
    }

    // Exchange authorization code for tokens
    const tokensResult = await exchangeAuthorizationCodeForTokens({
      code,
      clientId: this.config.clientId,
      clientSecret: this.config.clientSecret,
      redirectUri: this.config.redirectUri,
      codeVerifier: oauthStatePayload.codeVerifier,
    });

    if (tokensResult.isErr()) {
      return err(tokensResult.error);
    }

    const tokens = tokensResult.value;

    // Decode the id_token for user claims
    const userClaimsResult = decodeGoogleIdToken(tokens.id_token);

    if (userClaimsResult.isErr()) {
      return err(userClaimsResult.error);
    }

    const userClaims = userClaimsResult.value;

    return ok(userClaims);
  }
}
