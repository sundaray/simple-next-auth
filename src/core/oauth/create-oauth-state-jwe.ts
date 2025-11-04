import { EncryptJWT } from 'jose';
import { ResultAsync } from 'neverthrow';
import { CreateOAuthStateJweError } from '../errors';

export interface OAuthStatePayload {
  state: string;
  codeVerifier: string;
  redirectTo?: `/${string}`;
  provider: string;
}

export interface CreateOAuthStateJWEParams {
  oauthState: OAuthStatePayload;
  secret: string;
  maxAge: number;
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
