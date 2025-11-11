import { EncryptJWT } from 'jose';
import { ResultAsync } from 'neverthrow';
import type { UserSessionPayload } from './index';
import { EncryptUserSessionPayloadError } from './errors';
import { Buffer } from 'node:buffer';

export interface EncryptUserSessionPayloadParams {
  userSessionPayload: UserSessionPayload;
  secret: string;
  maxAge: number;
}

export function encryptUserSessionPayload(
  params: EncryptUserSessionPayloadParams,
): ResultAsync<string, EncryptUserSessionPayloadError> {
  return ResultAsync.fromPromise(
    (async () => {
      const { userSessionPayload, secret, maxAge } = params;

      console.log('User session payload: ', userSessionPayload);

      // Decode the base64 secret to get the raw bytes
      const secretKey = Buffer.from(secret, 'base64');

      const jwe = await new EncryptJWT(userSessionPayload)
        .setProtectedHeader({ alg: 'dir', enc: 'A128CBC-HS256' })
        .setIssuedAt()
        .setExpirationTime(`${maxAge}s`)
        .encrypt(secretKey);

      return jwe;
    })(),
    (error) => new EncryptUserSessionPayloadError({ cause: error }),
  );
}
