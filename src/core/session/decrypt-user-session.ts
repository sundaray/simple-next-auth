import { jwtDecrypt } from 'jose';
import { ResultAsync } from 'neverthrow';
import { DecryptUserSessionError } from './errors';
import type { UserSessionPayload } from './index';
import { Buffer } from 'node:buffer';

export interface DecryptUserSessionParams {
  session: string;
  secret: string;
}

export function decryptUserSession(
  params: DecryptUserSessionParams,
): ResultAsync<UserSessionPayload, DecryptUserSessionError> {
  const { session, secret } = params;

  // Decode the base64 secret to get the raw bytes
  const secretKey = Buffer.from(secret, 'base64');

  return ResultAsync.fromPromise(
    (async () => {
      const { payload } = await jwtDecrypt(session, secretKey);
      return payload as UserSessionPayload;
    })(),
    (error) => new DecryptUserSessionError({ cause: error }),
  );
}
