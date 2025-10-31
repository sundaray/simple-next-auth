import { base64url } from 'jose';
import { getRandomValues } from 'uncrypto';
import { Result } from 'neverthrow';

// ============================================
// ERROR TYPES
// ============================================

export type StateGenerationError = {
  type: 'STATE_GENERATION_ERROR';
  message: string;
  cause?: unknown;
};

// ============================================
// GENERATE STATE
// ============================================

export function generateState(): Result<string, StateGenerationError> {
  return Result.fromThrowable(
    () => {
      const randomBytes = new Uint8Array(32);
      getRandomValues(randomBytes);
      return base64url.encode(randomBytes);
    },
    (error): StateGenerationError => ({
      type: 'STATE_GENERATION_ERROR',
      message: 'Failed to generate state.',
      cause: error,
    }),
  )();
}
