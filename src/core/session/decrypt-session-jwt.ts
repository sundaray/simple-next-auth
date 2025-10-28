import { jwtDecrypt } from 'jose';
import { ResultAsync } from 'neverthrow';
import type { SessionData } from './create-session-jwt.js';

// ============================================
// ERROR TYPES
// ============================================

export type SessionJWTDecryptionError = {
  type: 'SESSION_JWT_DECRYPTION_ERROR';
  message: string;
  cause?: unknown;
};

// ============================================
// TYPES
// ============================================

export interface DecryptSessionJWTParams {
  jwt: string;
  secret: string;
}

// ============================================
// DECRYPT SESSION JWT
// ============================================

/**
 * Decrypts and validates an encrypted JWT (JWE) containing session data.
 */
export function decryptSessionJWT(
  params: DecryptSessionJWTParams,
): ResultAsync<SessionData, SessionJWTDecryptionError> {
  return ResultAsync.fromPromise(
    (async () => {
      const { jwt, secret } = params;

      // Convert secret string to Uint8Array (required by jose)
      const secretKey = new TextEncoder().encode(secret);

      // Decrypt and verify JWT
      const { payload } = await jwtDecrypt(jwt, secretKey);

      // Extract session data from payload
      const sessionData = payload.session as SessionData;

      if (!sessionData) {
        throw new Error('Session data not found in JWT payload');
      }

      return sessionData;
    })(),
    (error): SessionJWTDecryptionError => ({
      type: 'SESSION_JWT_DECRYPTION_ERROR',
      message: 'Failed to decrypt session JWT',
      cause: error,
    }),
  );
}
