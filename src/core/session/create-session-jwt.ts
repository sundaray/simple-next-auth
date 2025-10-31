import { EncryptJWT } from 'jose';
import { ResultAsync } from 'neverthrow';
import type { SessionData } from './session-schema.js';

export type SessionJWTCreationError = {
  type: 'SESSION_JWT_CREATION_ERROR';
  message: string;
  cause?: unknown;
};

// ============================================
//
// CREATE SESSION JWT
//
// ============================================

export function createSessionJWT(
  sessionData: SessionData,
): ResultAsync<string, SessionJWTCreationError> {
  return ResultAsync.fromPromise(
    (async () => {
      const { secret, maxAge } = sessionData;

      // Convert secret string to Uint8Array (required by jose)
      const secretKey = new TextEncoder().encode(secret);

      // Create encrypted JWT
      const jwt = await new EncryptJWT({ session: sessionData })
        .setProtectedHeader({ alg: 'dir', enc: 'A256CBC-HS512' })
        .setIssuedAt()
        .setExpirationTime(`${maxAge}s`)
        .encrypt(secretKey);

      return jwt;
    })(),
    (error): SessionJWTCreationError => ({
      type: 'SESSION_JWT_CREATION_ERROR',
      message: 'Failed to create session JWT',
      cause: error,
    }),
  );
}
