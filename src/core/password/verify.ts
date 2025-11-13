import { scryptAsync } from '@noble/hashes/scrypt.js';
import { timingSafeEqual } from 'node:crypto';
import { ResultAsync } from 'neverthrow';
import { VerifyPasswordError, InvalidPasswordHashFormatError } from './errors';
import { Buffer } from 'node:buffer';

export function verifyPassword(
  inputPassword: string,
  storedPasswordHash: string,
): ResultAsync<boolean, VerifyPasswordError | InvalidPasswordHashFormatError> {
  return ResultAsync.fromPromise(
    (async () => {
      // Parse the password hash
      const parts = storedPasswordHash.split('$');

      if (parts.length !== 5 || parts[1] !== 'scrypt') {
        throw new InvalidPasswordHashFormatError();
      }

      // Extract scrypt params, salt and hash
      const paramsString = parts[2]!;
      const saltBase64 = parts[3]!;
      const hashBase64 = parts[4]!;

      // Parse scrypt parameters with validation
      const params: Record<string, number> = {};

      for (const param of paramsString.split(',')) {
        const [key, value] = param.split('=');

        if (!key || value === undefined) {
          throw new InvalidPasswordHashFormatError({
            message: 'Invalid scrypt parameter format.',
          });
        }

        const numValue = parseInt(value, 10);

        if (isNaN(numValue)) {
          throw new InvalidPasswordHashFormatError({
            message: `Invalid number value for parameter '${key}': ${value}`,
          });
        }

        params[key] = numValue;
      }

      // Extract required parameters with type safety
      const N = params['n'];
      const r = params['r'];
      const p = params['p'];

      if (N === undefined || r === undefined || p === undefined) {
        throw new InvalidPasswordHashFormatError({
          message: 'Missing required scrypt parameters (n, r, p).',
        });
      }

      const maxmem = 128 * N * r * 2;

      // Decode salt and hash from base64
      const salt = Buffer.from(saltBase64, 'base64');
      const storedHash = Buffer.from(hashBase64, 'base64');

      // Normalize the input password
      const normalizedPassword = inputPassword.normalize('NFKC');

      // Rehash the input password
      const inputHash = await scryptAsync(normalizedPassword, salt, {
        N,
        r,
        p,
        dkLen: storedHash.length,
        maxmem,
      });

      if (inputHash.length !== storedHash.length) {
        return false;
      }

      return timingSafeEqual(inputHash, storedHash);
    })(),
    (error) => {
      if (error instanceof InvalidPasswordHashFormatError) {
        return error;
      }
      return new VerifyPasswordError({ cause: error });
    },
  );
}
