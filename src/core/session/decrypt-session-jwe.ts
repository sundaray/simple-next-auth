import { jwtDecrypt } from 'jose';
import { ResultAsync, ok, err } from 'neverthrow';
import { SessionDataSchema, type SessionData } from './session-schema.js';
import type { ZodError } from 'zod';

// ============================================
// ERROR TYPES
// ============================================

type JwtDecryptionError = {
  type: 'SESSION_JWT_DECRYPTION_ERROR';
  message: string;
  cause?: unknown;
};

type InvalidSessionDataError = {
  type: 'INVALID_SESSION_DATA';
  message: string;
  cause: ZodError;
};

export type SessionJWTDecryptionError =
  | JwtDecryptionError
  | InvalidSessionDataError;

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
  const { jwt, secret } = params;
  const secretKey = new TextEncoder().encode(secret);

  return (
    ResultAsync.fromPromise(
      jwtDecrypt(jwt, secretKey),
      (error): JwtDecryptionError => ({
        type: 'SESSION_JWT_DECRYPTION_ERROR',
        message: 'Failed to decrypt session JWT',
        cause: error,
      }),
    )
      // This runs ONLY if jwtDecrypt succeeded.
      // 'payload' is the successful result from the previous step.
      .andThen(({ payload }) => {
        // 3. Run the synchronous, non-throwing validation.
        const parseResult = SessionDataSchema.safeParse(payload.session);

        if (parseResult.success) {
          // It's a success! Return a synchronous 'ok' result.
          return ok(parseResult.data);
        } else {
          // It's a failure! Return a synchronous 'err' result.
          return err({
            type: 'INVALID_SESSION_DATA',
            message: `Invalid session data structure: ${parseResult.error.message}`,
            cause: parseResult.error,
          } as InvalidSessionDataError);
        }
      })
  );
}
