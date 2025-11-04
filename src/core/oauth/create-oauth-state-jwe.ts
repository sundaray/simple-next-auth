import { EncryptJWT } from 'jose';
import { ResultAsync } from 'neverthrow';
import { CreateOAuthStateJweError } from '../errors';

// ============================================
// TYPES
// ============================================

export interface OAuthStateData {
  state: string;
  codeVerifier: string;
  redirectTo?: `/${string}`; // Where to redirect after successful sign-in
}

export interface CreateOAuthStateJWEParams {
  oauthState: OAuthStateData;
  secret: string;
  maxAge: number; // in seconds (typically 10 minutes)
}

// ============================================
// CREATE OAUTH STATE JWE
// ============================================

export function createOAuthStateJWE(
  params: CreateOAuthStateJWEParams,
): ResultAsync<string, CreateOAuthStateJweError> {
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
    (error) => new CreateOAuthStateJweError({ cause: error }),
  );
}
