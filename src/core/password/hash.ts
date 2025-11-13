import { scryptAsync } from '@noble/hashes/scrypt.js';
import { randomBytes } from '@noble/hashes/utils.js';
import { ResultAsync } from 'neverthrow';
import { HashPasswordError } from './errors';

/**
 * Scrypt parameters for password hashing.
 *
 * Following OWASP recommended minimum configuration:
 * - N=2^17 (131072): CPU/memory cost - OWASP minimum for secure systems
 * - r=8: Block size - standard value (1024 bytes)
 * - p=1: Parallelization - JS is single-threaded, higher values don't help
 * - dkLen=32: 256-bit output
 * - maxmem: Prevents DoS attacks (formula: 128 * N * r * 2)
 *
 */

const SCRYPT_PARAMS = {
  N: 2 ** 17,
  r: 8,
  p: 1,
  dkLen: 32,
  maxmem: 128 * 2 ** 17 * 8 * 2,
} as const;

const SALT_LENGTH = 16;

export function hashPassword(
  password: string,
): ResultAsync<string, HashPasswordError> {
  return ResultAsync.fromPromise(
    (async () => {
      // Normalize password to handle Unicode variants consistently
      const normalizedPassword = password.normalize('NFKC');

      // Generate cryptographically secure random salt
      const salt = randomBytes(SALT_LENGTH);

      // Hash password with scrypt
      const hash = await scryptAsync(normalizedPassword, salt, SCRYPT_PARAMS);

      // Encode salt and hash to base64
      const saltBase64 = Buffer.from(salt).toString('base64');
      const hashBase64 = Buffer.from(hash).toString('base64');

      // Format: $scrypt$n=131072,r=8,p=1$<salt>$<hash>
      const formatted = `$scrypt$n=${SCRYPT_PARAMS.N},r=${SCRYPT_PARAMS.r},p=${SCRYPT_PARAMS.p}$${saltBase64}$${hashBase64}`;

      return formatted;
    })(),
    (error) => new HashPasswordError({ cause: error }),
  );
}
