import { generateState } from '../core/pkce/index.js';
import { generateCodeVerifier } from '../core/pkce/index.js';
import { generateCodeChallenge } from '../core/pkce/index.js';
import { createOAuthStateJWT } from '../core/oauth/index.js';
import { createAuthorizationUrl } from '../core/oauth/index.js';
import { redirect } from '../adapters/nextjs/index.js';
import type { AuthConfig } from '../config/schema.js';

export interface SignInWithGoogleOptions {
  redirectTo?: `/${string}`;
}

// ============================================
// SIGN IN WITH GOOGLE
// ============================================

export async function signInWithGoogle(
  config: AuthConfig,
  options?: SignInWithGoogleOptions,
): Promise<never> {
  // Check if Google provider is configured
  if (!config.providers.google) {
    throw new Error('Google provider is not configured');
  }

  const googleConfig = config.providers.google;

  // Step 1: Generate random state for CSRF protection
  const stateResult = generateState();
  if (stateResult.isErr()) {
    throw new Error('Failed to generate OAuth state', {
      cause: stateResult.error,
    });
  }
  const state = stateResult.value;

  // Step 2: Generate PKCE code verifier
  const codeVerifierResult = generateCodeVerifier();
  if (codeVerifierResult.isErr()) {
    throw new Error('Failed to generate PKCE code verifier', {
      cause: codeVerifierResult.error,
    });
  }
  const codeVerifier = codeVerifierResult.value;

  // Step 3: Generate PKCE code challenge
  const codeChallengeResult = await generateCodeChallenge(codeVerifier);
  if (codeChallengeResult.isErr()) {
    throw new Error('Failed to generate PKCE code challenge', {
      cause: codeChallengeResult.error,
    });
  }
  const codeChallenge = codeChallengeResult.value;

  // Step 4: Create OAuth state JWT (stores state + code verifier securely)
  const oauthStateJWTResult = await createOAuthStateJWT({
    oauthState: {
      state,
      codeVerifier,
      redirectTo: options?.redirectTo || '/',
    },
    secret: config.session.secret,
    maxAge: 60 * 10, // OAuth state valid for 10 minutes
  });

  if (oauthStateJWTResult.isErr()) {
    console.error(
      'Failed to create OAuth state JWT: ',
      oauthStateJWTResult.error,
    );
    throw new Error('Failed to create OAuth state JWT', {
      cause: oauthStateJWTResult.error,
    });
  }

  // Step 5: Build Google authorization URL
  const authUrlResult = createAuthorizationUrl({
    clientId: googleConfig.clientId,
    redirectUri: googleConfig.redirectUri,
    state: oauthStateJWTResult.value,
    codeChallenge,
    scopes: googleConfig.scopes,
    prompt: 'consent',
  });

  if (authUrlResult.isErr()) {
    throw new Error('Failed to create authorization URL', {
      cause: authUrlResult.error,
    });
  }

  // Step 6: Redirect to Google
  // This throws NEXT_REDIRECT error which Next.js catches
  redirect(authUrlResult.value);
}
