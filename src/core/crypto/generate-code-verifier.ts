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
 * A code verifier is a cryptographic random string.
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
      // Generate 32 random bytes (results in 43 characters when base64url-encoded)
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
