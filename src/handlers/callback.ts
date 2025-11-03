import { decryptOAuthStateJWT } from '../core/oauth/index.js';
import { exchangeCodeForTokens } from '../core/oauth/index.js';
import { decodeIdToken } from '../core/oauth/index.js';
import { createSessionJWT } from '../core/session/index.js';
import {
  setCookie,
  COOKIE_NAMES,
  redirect,
  RedirectType,
} from '../adapters/nextjs/index.js';
import type { AuthConfig } from '../config/schema.js';

// ============================================
//
// GOOGLE OAUTH CALLBACK
//
// ============================================

export async function handleGoogleCallback(
  config: AuthConfig,
  request: Request,
): Promise<never> {
  // Check if Google provider is configured
  if (!config.providers?.google) {
    throw new Error('Google provider is not configured');
  }

  const googleConfig = config.providers.google;

  // Step 1: Parse callback URL
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');

  // Validate required parameters
  if (!code) {
    throw new Error('Missing authorization code in callback');
  }

  if (!state) {
    throw new Error('Missing state parameter in callback');
  }

  // Step 2: Decrypt and validate OAuth state JWT
  const oauthStateResult = await decryptOAuthStateJWT({
    jwt: state,
    secret: config.session.secret,
  });

  if (oauthStateResult.isErr()) {
    throw new Error('Invalid or expired OAuth state', {
      cause: oauthStateResult.error,
    });
  }

  const oauthState = oauthStateResult.value;

  // Step 3: Exchange authorization code for tokens (PKCE)
  const tokensResult = await exchangeCodeForTokens({
    code,
    clientId: googleConfig.clientId,
    clientSecret: googleConfig.clientSecret,
    redirectUri: googleConfig.redirectUri,
    codeVerifier: oauthState.codeVerifier,
  });

  if (tokensResult.isErr()) {
    throw new Error('Failed to exchange code for tokens', {
      cause: tokensResult.error,
    });
  }

  const tokens = tokensResult.value;

  // Step 4: Decode ID token to get user info
  const idTokenResult = decodeIdToken(tokens.id_token);

  if (idTokenResult.isErr()) {
    throw new Error('Failed to decode ID token', {
      cause: idTokenResult.error,
    });
  }

  const userInfo = idTokenResult.value;

  // Step 5: Run users google callback
  let customSessionData = {};
  if (config.callbacks?.google) {
    try {
      customSessionData = await config.callbacks.google(userInfo);
    } catch (error) {
      throw new Error('Error in user-defined "google" callback:', {
        cause: error,
      });
    }
  }

  // Step 5: Create session JWT
  const sessionResult = await createSessionJWT({
    ...customSessionData,
    createdAt: Date.now(),
    expiresAt: Date.now() + config.session.maxAge * 1000,
    secret: config.session.secret,
    maxAge: config.session.maxAge,
    provider: 'google',
  });

  if (sessionResult.isErr()) {
    throw new Error('Failed to create session', {
      cause: sessionResult.error,
    });
  }

  const sessionJWT = sessionResult.value;

  // Step 6: Set session cookie
  const cookieResult = await setCookie(COOKIE_NAMES.SESSION, sessionJWT, {
    maxAge: config.session.maxAge,
  });

  if (cookieResult.isErr()) {
    throw new Error('Failed to set session cookie', {
      cause: cookieResult.error,
    });
  }

  // Step 7: Redirect to success page
  const redirectTo = oauthState.redirectTo || '/';
  redirect(redirectTo, RedirectType.replace); // Replace history - no back to callback
}
