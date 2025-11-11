import { jwtDecrypt } from 'jose';
import { ResultAsync } from 'neverthrow';
import { DecryptUserSessionJweError } from './errors';
import type { UserSessionPayload } from './index';
import { Buffer } from 'node:buffer';

export interface DecryptUserSessionJWEParams {
  jwe: string;
  secret: string;
}

export function decryptUserSessionJWE(
  params: DecryptUserSessionJWEParams,
): ResultAsync<UserSessionPayload, DecryptUserSessionJweError> {
  const { jwe, secret } = params;

  // Decode the base64 secret to get the raw bytes
  const secretKey = Buffer.from(secret, 'base64');

  return ResultAsync.fromPromise(
    (async () => {
      const { payload } = await jwtDecrypt(jwe, secretKey);
      return payload as UserSessionPayload;
    })(),
    (error) => new DecryptUserSessionJweError({ cause: error }),
  );
}
