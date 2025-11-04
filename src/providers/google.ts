import type { OAuthStrategy, BaseSignInOptions } from '../core/strategy';

import type { AuthConfig, GoogleProviderConfig } from '../config/schema';

import type { GoogleIdTokenPayload, GoogleTokenResponse } from '../core/oauth';

import {
  generateCodeChallenge,
  generateCodeVerifier,
  generateState,
} from '../core/pkce';

import {
  createOAuthStateJWE,
  createAuthorizationUrl,
  decryptOAuthStateJWT,
  exchangeCodeForTokens,
} from '../core/oauth';

import {
  MissingAuthorizationCodeError,
  MissingStateError,
} from '../core/errors';

import { decodeIdToken } from '../core/oauth';

import type { AuthAdapter } from '../core/adapter';

import {
  GenerateStateError,
  GenerateCodeVerifierError,
  GenerateCodeChallengeError,
} from '../core/errors';

export interface SignInWithGoogleOptions extends BaseSignInOptions {}

export interface GoogleAuthResult {
  userInfo: GoogleIdTokenPayload;
  tokens: GoogleTokenResponse;
  oauthState: {
    state: string;
    codeVerifier: string;
    redirectTo?: string | undefined;
  };
}

// ============================================
//
// Google provider
//
// ============================================
export class GoogleProvider
  implements
    OAuthStrategy<
      GoogleProviderConfig,
      SignInWithGoogleOptions,
      GoogleAuthResult
    >
{
  config: AuthConfig;
  providerConfig: GoogleProviderConfig;
  adapter: AuthAdapter;

  constructor(config: AuthConfig, adapter: AuthAdapter) {
    if (!config.providers?.google) {
      throw new Error('Google provider is not configured.');
    }
    this.config = config;
    this.providerConfig = config.providers.google;
    this.adapter = adapter;
  }

  // ============================================
  // Sign in
  // ============================================

  async signIn(options: SignInWithGoogleOptions): Promise<void> {
    // Generate state
    const stateResult = generateState();
    if (stateResult.isErr()) {
      throw new GenerateStateError({ cause: stateResult.error });
    }

    const state = stateResult.value;

    // Generate code verifier
    const codeVerifierResult = generateCodeVerifier();
    if (codeVerifierResult.isErr()) {
      throw new GenerateCodeVerifierError({ cause: codeVerifierResult.error });
    }

    const codeVerifier = codeVerifierResult.value;

    // Generate code challenge
    const codeChallengeResult = await generateCodeChallenge(codeVerifier);
    if (codeChallengeResult.isErr()) {
      throw new GenerateCodeChallengeError({
        cause: codeChallengeResult.error,
      });
    }

    const codeChallenge = codeChallengeResult.value;

    // Create OAuth state JWT
    const oauthStateJWEResult = await createOAuthStateJWE({
      oauthState: {
        state,
        codeVerifier,
        redirectTo: options.redirectTo || '/',
      },
      secret: this.config.session.secret,
      maxAge: 60 * 10, // 10 minutes
    });

    if (oauthStateJWEResult.isErr()) {
      throw new Error('Failed to create OAuth state JWT,', {
        cause: oauthStateJWTResult.error,
      });
    }

    const oauthState = oauthStateJWEResult.value;

    // Set OAuth state cookie

    // Create authorization URL
    const authorizationUrlResult = createAuthorizationUrl({
      clientId: this.providerConfig.clientId,
      redirectUri: this.providerConfig.redirectUri,
      state,
      codeChallenge,
      prompt: 'select_account',
    });

    if (authorizationUrlResult.isErr()) {
      throw new Error('Failed to create authorization URL.', {
        cause: authorizationUrlResult.error,
      });
    }

    const authorizationUrl = authorizationUrlResult.value;

    // Redirect user to authorization URL
    this.adapter.redirect(authorizationUrl);
  }

  // ============================================
  // Handle callback
  // ============================================
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

    // Compare the cookie state with url state

    // Exchange authorization code for tokens
    const tokensResult = await exchangeCodeForTokens({
      code,
      clientSecret: this.providerConfig.clientSecret,
      redirectUri: this.providerConfig.redirectUri,
      codeVerifier: oauthStateData.codeVerifier,
    });

    if (tokensResult.isErr()) {
    }

    const tokens = tokensResult.value;

    const userClaimsResult = decodeIdToken(tokens.id_token);
    if (userClaims.isErr()) {
    }

    const userClaims = userClaimsResult.value;

    // Decode the id_token for user claims

    // return values
    return { userClaims, tokens, oauthState };
  }
}
