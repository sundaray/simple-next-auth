import { jwtDecrypt } from 'jose';
import { ResultAsync } from 'neverthrow';
import { DecryptUserSessionJweError } from '../errors';
import type { UserSessionPayload } from './index';

export interface DecryptUserSessionJWEParams {
  jwe: string;
  secret: string;
}

export function decryptUserSessionJWE(
  params: DecryptUserSessionJWEParams,
): ResultAsync<UserSessionPayload, DecryptUserSessionJweError> {
  const { jwe, secret } = params;

  const secretKey = new TextEncoder().encode(secret);

  return ResultAsync.fromPromise(
    (async () => {
      const { payload } = await jwtDecrypt(jwe, secretKey);
      return payload as UserSessionPayload;
    })(),
    (error) => new DecryptUserSessionJweError({ cause: error }),
  );
}
