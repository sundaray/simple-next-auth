import { jwtDecrypt } from 'jose';
import { ResultAsync, ok, err } from 'neverthrow';
import { z } from 'zod';
import type { ZodError } from 'zod';

// ============================================
// ZOD SCHEMA
// ============================================

/**
 * Zod schema for OAuth state data validation
 */
const OAuthStateDataSchema = z.object({
  state: z.string().min(1),
  codeVerifier: z.string().min(1),
  redirectTo: z.string().optional(),
});

export type OAuthStateData = z.infer<typeof OAuthStateDataSchema>;

// ============================================
// ERROR TYPES
// ============================================

type JwtDecryptionError = {
  type: 'OAUTH_STATE_JWT_DECRYPTION_ERROR';
  message: string;
  cause?: unknown;
};

type InvalidOAuthStateDataError = {
  type: 'INVALID_OAUTH_STATE_DATA';
  message: string;
  cause: ZodError;
};

export type OAuthStateJWTDecryptionError =
  | JwtDecryptionError
  | InvalidOAuthStateDataError;

// ============================================
// TYPES
// ============================================

export interface DecryptOAuthStateJWTParams {
  jwt: string;
  secret: string;
}

// ============================================
// DECRYPT OAUTH STATE JWT
// ============================================

/**
 * Decrypts and validates an encrypted JWT (JWE) containing OAuth state data.
 */
export function decryptOAuthStateJWT(
  params: DecryptOAuthStateJWTParams,
): ResultAsync<OAuthStateData, OAuthStateJWTDecryptionError> {
  const { jwt, secret } = params;
  const secretKey = new TextEncoder().encode(secret);

  return (
    ResultAsync.fromPromise(
      jwtDecrypt(jwt, secretKey),
      (error): JwtDecryptionError => ({
        type: 'OAUTH_STATE_JWT_DECRYPTION_ERROR',
        message: 'Failed to decrypt OAuth state JWT',
        cause: error,
      }),
    )
      // This runs ONLY if jwtDecrypt succeeded.
      // 'payload' is the successful result from the previous step.
      .andThen(({ payload }) => {
        // Run the synchronous, non-throwing validation.
        const parseResult = OAuthStateDataSchema.safeParse(payload.oauthState);

        if (parseResult.success) {
          // It's a success! Return a synchronous 'ok' result.
          return ok(parseResult.data);
        } else {
          // It's a failure! Return a synchronous 'err' result.
          return err({
            type: 'INVALID_OAUTH_STATE_DATA',
            message: `Invalid OAuth state data: ${parseResult.error.message}`,
            cause: parseResult.error,
          } as InvalidOAuthStateDataError);
        }
      })
  );
}
