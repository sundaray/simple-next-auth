import { base64url } from 'jose';
import crypto from 'node:crypto';
import { ResultAsync } from 'neverthrow';
import { GenerateCodeChallengeError } from './errors';

/**
 * Generates a SHA-256 code challenge from a code verifier for OAuth 2.0 PKCE flow.
 *
 * The code challenge is derived from the code verifier by hashing it with SHA-256
 * and encoding the result as base64url. This method is called "S256" in the
 * OAuth 2.0 PKCE specification.
 */
export function generateCodeChallenge(
  codeVerifier: string,
): ResultAsync<string, GenerateCodeChallengeError> {
  return ResultAsync.fromPromise(
    (async () => {
      const verifierBytes = new TextEncoder().encode(codeVerifier);
      const hashBuffer = await crypto.subtle.digest('SHA-256', verifierBytes);
      const hashBytes = new Uint8Array(hashBuffer);
      return base64url.encode(hashBytes);
    })(),
    (error) => new GenerateCodeChallengeError({ cause: error }),
  );
}
