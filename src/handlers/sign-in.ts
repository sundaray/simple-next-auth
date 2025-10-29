import { generateState } from '../core/pkce/index.js';
import { generateCodeVerifier } from '../core/pkce/index.js';
import { generateCodeChallenge } from '../core/pkce/index.js';
import { createOAuthStateJWT } from '../core/oauth/index.js';
import { createAuthorizationUrl } from '../core/oauth/index.js';
import { redirect } from '../adapters/nextjs/index.js';
import type { AuthConfig } from '../config/schema.js';

// ============================================
// SIGN IN WITH GOOGLE
// ============================================

/**
 * Initiates Google OAuth sign-in flow.
 *
 * This function:
 * 1. Generates random state for CSRF protection
 * 2. Generates PKCE code verifier and challenge
 * 3. Creates encrypted OAuth state JWT (stores state + code verifier)
 * 4. Builds Google authorization URL
 * 5. Redirects user to Google
 *
 * @param config - Validated auth configuration
 * @throws {Error} If Google provider not configured
 * @throws {Error} If PKCE generation fails
 * @throws {Error} If OAuth state creation fails
 * @throws {Error} If authorization URL creation fails
 * @returns Never returns (redirects to Google)
 */
export async function signInWithGoogle(config: AuthConfig): Promise<never> {
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
      // ← Fixed: correct parameter name
      state,
      codeVerifier,
      redirectTo: '/dashboard', // Where to go after successful sign-in
    },
    secret: config.session.secret,
    maxAge: 60 * 10, // OAuth state valid for 10 minutes
  });

  if (oauthStateJWTResult.isErr()) {
    throw new Error('Failed to create OAuth state JWT', {
      cause: oauthStateJWTResult.error,
    });
  }

  // Step 5: Build Google authorization URL
  const authUrlResult = createAuthorizationUrl({
    clientId: googleConfig.clientId,
    redirectUri: googleConfig.redirectUri,
    state: oauthStateJWTResult.value, // Use the JWT as the state parameter
    codeChallenge,
    scopes: googleConfig.scopes,
    prompt: 'consent', // ← Fixed: added required prompt parameter
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
