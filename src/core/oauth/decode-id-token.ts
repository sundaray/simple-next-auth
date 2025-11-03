import { decodeJwt } from 'jose';
import { Result, ok, err } from 'neverthrow';
import { z } from 'zod';
import type { ZodError } from 'zod';

// ============================================
// ZOD SCHEMA
// ============================================

/**
 * Zod schema for Google ID token payload
 *
 * Based on: https://developers.google.com/identity/openid-connect/openid-connect#obtainuserinfo
 */
const GoogleIdTokenPayloadSchema = z.object({
  // Always present - used for validation
  sub: z.string(), // Google user ID (unique, never changes)
  iss: z.string(), // Issuer (always "https://accounts.google.com" or "accounts.google.com")
  aud: z.string(), // Audience (your client ID)
  exp: z.number(), // Expiration time (Unix timestamp)
  iat: z.number(), // Issued at time (Unix timestamp)

  // Present if 'email' scope requested
  email: z.email().optional(),
  email_verified: z.boolean().optional(),

  // Present if 'profile' scope requested
  name: z.string().optional(),
  given_name: z.string().optional(),
  family_name: z.string().optional(),
  picture: z.string().url().optional(),
});

export type GoogleIdTokenPayload = z.infer<typeof GoogleIdTokenPayloadSchema>;

// ============================================
// ERROR TYPES
// ============================================

type IdTokenDecodeError = {
  type: 'ID_TOKEN_DECODE_ERROR';
  message: string;
  cause?: unknown;
};

type InvalidIdTokenPayloadError = {
  type: 'INVALID_ID_TOKEN_PAYLOAD';
  message: string;
  cause: ZodError;
};

export type DecodeIdTokenError =
  | IdTokenDecodeError
  | InvalidIdTokenPayloadError;

// ============================================
// DECODE ID TOKEN
// ============================================

/**
 * Decodes a Google ID token (JWT).
 *
 * Note: This function only decodes the JWT. It does NOT verify the signature.
 *
 * According to Google's documentation: "since you are communicating directly
 * with Google over an intermediary-free HTTPS channel and using your client
 * secret to authenticate yourself to Google, you can be confident that the
 * token you receive really comes from Google and is valid."
 *
 * Source: https://developers.google.com/identity/openid-connect/openid-connect#obtainuserinfo
 *
 * IMPORTANT: If you pass this ID token to other components of your app,
 * those components MUST validate the signature.
 */
export function decodeIdToken(
  idToken: string,
): Result<GoogleIdTokenPayload, DecodeIdTokenError> {
  return Result.fromThrowable(
    () => decodeJwt(idToken),
    (error): IdTokenDecodeError => ({
      type: 'ID_TOKEN_DECODE_ERROR',
      message: 'Failed to decode ID token',
      cause: error,
    }),
  )().andThen((payload) => {
    // Validate payload structure with Zod
    const parseResult = GoogleIdTokenPayloadSchema.safeParse(payload);

    if (parseResult.success) {
      return ok(parseResult.data);
    } else {
      return err({
        type: 'INVALID_ID_TOKEN_PAYLOAD',
        message: `Invalid ID token payload: ${parseResult.error.message}`,
        cause: parseResult.error,
      } as InvalidIdTokenPayloadError);
    }
  });
}
