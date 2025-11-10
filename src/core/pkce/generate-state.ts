import { base64url } from 'jose';
import crypto from 'node:crypto';
import { Result } from 'neverthrow';
import { GenerateStateError } from './errors';

export function generateState(): Result<string, GenerateStateError> {
  return Result.fromThrowable(
    () => {
      const randomBytes = crypto.randomBytes(32);
      return base64url.encode(randomBytes);
    },
    (error) => new GenerateStateError({ cause: error }),
  )();
}
