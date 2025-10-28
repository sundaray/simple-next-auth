import { EncryptJWT } from 'jose';
import { ResultAsync } from 'neverthrow';

// ============================================
// ERROR TYPES
// ============================================

export type OAuthStateJWTCreationError = {
  type: 'OAUTH_STATE_JWT_CREATION_ERROR';
  message: string;
  cause?: unknown;
};

// ============================================
// TYPES
// ============================================

export interface OAuthStateData {
  state: string;
  codeVerifier: string;
  redirectTo?: string; // Where to redirect after successful sign-in
}

export interface CreateOAuthStateJWTParams {
  oauthState: OAuthStateData;
  secret: string;
  maxAge: number; // in seconds (typically 10 minutes)
}

// ============================================
// CREATE OAUTH STATE JWT
// ============================================

/**
 * Creates an encrypted JWT (JWE) containing OAuth state data.
 *
 * This JWT is stored in a short-lived cookie (10 minutes) and contains:
 * - state: Random CSRF token
 * - codeVerifier: PKCE code verifier
 * - redirectTo: Optional redirect destination after sign-in
 *
 */
export function createOAuthStateJWT(
  params: CreateOAuthStateJWTParams,
): ResultAsync<string, OAuthStateJWTCreationError> {
  return ResultAsync.fromPromise(
    (async () => {
      const { oauthState, secret, maxAge } = params;

      // Convert secret string to Uint8Array (required by jose)
      const secretKey = new TextEncoder().encode(secret);

      // Create encrypted JWT
      const jwt = await new EncryptJWT({ oauthState })
        .setProtectedHeader({ alg: 'dir', enc: 'A256CBC-HS512' })
        .setIssuedAt()
        .setExpirationTime(`${maxAge}s`)
        .encrypt(secretKey);

      return jwt;
    })(),
    (error): OAuthStateJWTCreationError => ({
      type: 'OAUTH_STATE_JWT_CREATION_ERROR',
      message: 'Failed to create OAuth state JWT',
      cause: error,
    }),
  );
}
