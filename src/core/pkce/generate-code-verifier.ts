import { base64url } from 'jose';
import crypto from 'node:crypto';
import { Result } from 'neverthrow';

// ============================================
// ERROR TYPES
// ============================================

export type CodeVerifierGenerationError = {
  type: 'CODE_VERIFIER_GENERATION_ERROR';
  message: string;
  cause?: unknown;
};

// ============================================
// GENERATE CODE VERIFIER
// ============================================

/**
 * Generates a cryptographically random code verifier for the OAuth 2.0 PKCE flow.
 *
 * Implements the RFC 7636 recommendation by generating 32 random bytes
 * and base64url-encoding them to create a 43-character string.
 *
 * RFC 7636 spec:
 * - MUST be between 43 and 128 characters long
 * - Uses characters: [A-Z] / [a-z] / [0-9] / "-" / "." / "_" / "~"
 */
export function generateCodeVerifier(): Result<
  string,
  CodeVerifierGenerationError
> {
  return Result.fromThrowable(
    () => {
      const randomBytes = crypto.randomBytes(32);
      return base64url.encode(randomBytes);
    },
    (error): CodeVerifierGenerationError => ({
      type: 'CODE_VERIFIER_GENERATION_ERROR',
      message: 'Failed to generate code verifier.',
      cause: error,
    }),
  )();
}
