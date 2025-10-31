import { base64url } from 'jose';
import crypto from 'node:crypto';
import { ResultAsync } from 'neverthrow';

// ============================================
// ERROR TYPES
// ============================================

export type CodeChallengeGenerationError = {
  type: 'CODE_CHALLENGE_GENERATION_ERROR';
  message: string;
  cause?: unknown;
};

// ============================================
// GENERATE CODE CHALLENGE (S256)
// ============================================

/**
 * Generates a SHA-256 code challenge from a code verifier for OAuth 2.0 PKCE flow.
 *
 * The code challenge is derived from the code verifier by hashing it with SHA-256
 * and encoding the result as base64url. This method is called "S256" in the
 * OAuth 2.0 PKCE specification.
 */
export function generateCodeChallenge(
  codeVerifier: string,
): ResultAsync<string, CodeChallengeGenerationError> {
  return ResultAsync.fromPromise(
    (async () => {
      const verifierBytes = new TextEncoder().encode(codeVerifier);
      const hashBuffer = await crypto.subtle.digest('SHA-256', verifierBytes);
      const hashBytes = new Uint8Array(hashBuffer);
      return base64url.encode(hashBytes);
    })(),
    (error): CodeChallengeGenerationError => ({
      type: 'CODE_CHALLENGE_GENERATION_ERROR',
      message: 'Failed to generate code challenge.',
      cause: error,
    }),
  );
}
