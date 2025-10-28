import { jwtDecrypt } from 'jose';
import { ResultAsync } from 'neverthrow';
import { SessionDataSchema, type SessionData } from './session-schema.js';

// ============================================
// ERROR TYPES
// ============================================

export type SessionJWTDecryptionError = {
  type: 'SESSION_JWT_DECRYPTION_ERROR' | 'INVALID_SESSION_DATA';
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

      // Validate session data structure with Zod
      const parseResult = SessionDataSchema.safeParse(payload.session);

      if (!parseResult.success) {
        // Create detailed error with Zod validation issues
        const error = new Error(
          `Invalid session data structure: ${parseResult.error.message}`,
        );
        error.name = 'INVALID_SESSION_DATA';
        throw error;
      }

      return parseResult.data;
    })(),
    (error): SessionJWTDecryptionError => {
      const err = error as Error;

      // Handle Zod validation errors
      if (err.name === 'INVALID_SESSION_DATA') {
        return {
          type: 'INVALID_SESSION_DATA',
          message: err.message,
          cause: error,
        };
      }

      // Handle JWT decryption/expiration errors
      return {
        type: 'SESSION_JWT_DECRYPTION_ERROR',
        message: 'Failed to decrypt session JWT',
        cause: error,
      };
    },
  );
}
