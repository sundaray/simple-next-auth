import type { OAuthProvider, BaseSignInOptions } from '../core/strategy';

import type { AuthConfig, GoogleProviderConfig } from '../config/schema';

import type { GoogleIdTokenPayload, GoogleTokenResponse } from '../core/oauth';

import {
  generateCodeChallenge,
  generateCodeVerifier,
  generateState,
} from '../core/pkce';

import {
  decodeIdToken,
  encryptOAuthStatePayload,
  createAuthorizationUrl,
  decryptOAuthStateJWE,
  exchangeAuthorizationCodeForTokens,
} from '../core/oauth';

import {
  MissingOAuthStateCookieError,
  MissingAuthorizationCodeError,
  MissingStateError,
  StateMismatchError,
} from '../core/errors';

import type { OAuthStatePayload } from '../types';

import { COOKIE_NAMES, OAUTH_STATE_MAX_AGE } from '../core/constants';

import type { FrameworkAdapter } from '../core/adapter';

export interface SignInWithGoogleOptions extends BaseSignInOptions {}

export interface GoogleAuthResult {
  userClaims: GoogleIdTokenPayload;
  tokens: GoogleTokenResponse;
  oauthState: OAuthStatePayload;
}

// --------------------------------------------
//
// Google provider
//
// --------------------------------------------
export class GoogleProvider
  implements
    OAuthProvider<
      GoogleProviderConfig,
      SignInWithGoogleOptions,
      GoogleAuthResult
    >
{
  config: AuthConfig;
  providerConfig: GoogleProviderConfig;
  adapter: FrameworkAdapter;

  constructor(config: AuthConfig, adapter: FrameworkAdapter) {
    if (!config.providers?.google) {
      throw new Error('Google provider is not configured.');
    }
    this.config = config;
    this.providerConfig = config.providers.google;
    this.adapter = adapter;
  }

  // --------------------------------------------
  // Sign in
  // --------------------------------------------

  async signIn(options: SignInWithGoogleOptions): Promise<void> {
    // Generate state
    const stateResult = generateState();
    if (stateResult.isErr()) {
      throw stateResult.error;
    }

    const state = stateResult.value;

    // Generate code verifier
    const codeVerifierResult = generateCodeVerifier();
    if (codeVerifierResult.isErr()) {
      throw codeVerifierResult.error;
    }

    const codeVerifier = codeVerifierResult.value;

    // Generate code challenge
    const codeChallengeResult = await generateCodeChallenge(codeVerifier);
    if (codeChallengeResult.isErr()) {
      throw codeChallengeResult.error;
    }

    const codeChallenge = codeChallengeResult.value;

    // Create OAuth state JWE
    const oauthStateJWEResult = await encryptOAuthStatePayload({
      oauthState: {
        state,
        codeVerifier,
        redirectTo: options.redirectTo || '/',
        provider: 'google',
      },
      secret: this.config.session.secret,
      maxAge: OAUTH_STATE_MAX_AGE,
    });

    if (oauthStateJWEResult.isErr()) {
      throw oauthStateJWEResult.error;
    }

    const oauthStateJwe = oauthStateJWEResult.value;

    // Set OAuth state cookie
    await this.adapter.setCookie(COOKIE_NAMES.OAUTH_STATE, oauthStateJwe, {
      maxAge: OAUTH_STATE_MAX_AGE,
    });

    // Create authorization URL
    const authorizationUrlResult = createAuthorizationUrl({
      clientId: this.providerConfig.clientId,
      redirectUri: this.providerConfig.redirectUri,
      state,
      codeChallenge,
      prompt: 'select_account',
    });

    if (authorizationUrlResult.isErr()) {
      throw authorizationUrlResult.error;
    }

    const authorizationUrl = authorizationUrlResult.value;

    // Redirect user to authorization URL
    this.adapter.redirect(authorizationUrl);
  }

  // --------------------------------------------
  // Handle callback
  // --------------------------------------------
  async handleCallback(request: Request): Promise<GoogleAuthResult> {
    const url = new URL(request.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');

    if (!code) {
      throw new MissingAuthorizationCodeError();
    }

    if (!state) {
      throw new MissingStateError();
    }

    // Get the OAuth state cookie
    const oauthStateJWE = await this.adapter.getCookie(
      COOKIE_NAMES.OAUTH_STATE,
    );

    if (!oauthStateJWE) {
      throw new MissingOAuthStateCookieError();
    }

    // Decrypt the Oauth state JWE
    const oauthStateResult = await decryptOAuthStateJWE({
      jwt: oauthStateJWE,
      secret: this.config.session.secret,
    });

    if (oauthStateResult.isErr()) {
      throw oauthStateResult.error;
    }

    const oauthStatePayload = oauthStateResult.value;

    // Compare the state stored in cookie with state stored in URL
    if (oauthStatePayload.state !== state) {
      throw new StateMismatchError();
    }

    // Exchange authorization code for tokens
    const tokensResult = await exchangeAuthorizationCodeForTokens({
      code,
      clientId: this.providerConfig.clientId,
      clientSecret: this.providerConfig.clientSecret,
      redirectUri: this.providerConfig.redirectUri,
      codeVerifier: oauthStatePayload.codeVerifier,
    });

    if (tokensResult.isErr()) {
      throw tokensResult.error;
    }

    const tokens = tokensResult.value;

    // Decode the id_token for user claims
    const userClaimsResult = decodeIdToken(tokens.id_token);

    if (userClaimsResult.isErr()) {
      throw userClaimsResult.error;
    }

    const userClaims = userClaimsResult.value;

    // Delete the OAuth state cookie
    await this.adapter.deleteCookie(COOKIE_NAMES.OAUTH_STATE);

    return {
      userClaims,
      tokens,
      oauthState: oauthStatePayload,
    };
  }
}
