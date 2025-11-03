import type { OAuthStrategy, BaseSignInOptions } from '../core/strategy';

import type { AuthConfig, GoogleProviderConfig } from '../config/schema';

import type { GoogleIdTokenPayload, GoogleTokenResponse } from '../core/oauth';

import {
  generateCodeChallenge,
  generateCodeVerifier,
  generateState,
} from '../core/pkce';

import {
  createOAuthStateJWT,
  createAuthorizationUrl,
  decryptOAuthStateJWT,
  exchangeCodeForTokens,
} from '../core/oauth';

import {
  MissingAuthorizationCodeError,
  MissingStateError,
} from '../core/errors';

import { redirect } from '../adapters/nextjs/redirect';

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

  constructor(config: AuthConfig) {
    if (!config.providers?.google) {
      throw new Error('Google provider is not configured.');
    }
    this.config = config;
    this.providerConfig = config.providers.google;
  }

  // ============================================
  // Sign in
  // ============================================

  async signIn(options: SignInWithGoogleOptions): Promise<never> {
    // Generate state
    const stateResult = generateState();
    if (stateResult.isErr()) {
      throw new Error('Failed to generate state', { cause: stateResult.error });
    }

    const state = stateResult.value;

    // Generate code verifier
    const codeVerifierResult = generateCodeVerifier();
    if (codeVerifierResult.isErr()) {
      throw new Error('Failed to generate code verifier.', {
        cause: codeVerifierResult.error,
      });
    }

    const codeVerifier = codeVerifierResult.value;

    // Generate code challenge
    const codeChallengeResult = await generateCodeChallenge(codeVerifier);
    if (codeChallengeResult.isErr()) {
      throw new Error('Failed to generate code challenge.', {
        cause: codeChallengeResult.error,
      });
    }

    const codeChallenge = codeChallengeResult.value;

    // Create OAuth state JWT
    const oauthStateJWTResult = await createOAuthStateJWT({
      oauthState: {
        state,
        codeVerifier,
        redirectTo: options.redirectTo || '/',
      },
      secret: this.config.session.secret,
      maxAge: 60 * 10, // 10 minutes
    });

    if (oauthStateJWTResult.isErr()) {
      throw new Error('Failed to create OAuth state JWT,', {
        cause: oauthStateJWTResult.error,
      });
    }

    const oauthState = oauthStateJWTResult.value;

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
    redirect(authorizationUrl);
  }

  // ============================================
  // Handle callback
  // ============================================
  async handleCallback(request: Request): Promise<GoogleAuthResult> {
    const url = new URL(request.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');

    if (!code) {
    }

    if (!state) {
    }
  }
}
