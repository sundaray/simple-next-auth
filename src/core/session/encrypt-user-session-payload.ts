import { EncryptJWT } from 'jose';
import { ResultAsync } from 'neverthrow';
import type { UserSessionPayload } from '../../types';
import { EncryptUserSessionPayloadError } from '../errors';

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

      const secretKey = new TextEncoder().encode(secret);

      const jwe = await new EncryptJWT({ session: userSessionPayload })
        .setProtectedHeader({ alg: 'dir', enc: 'A256CBC-HS256' })
        .setIssuedAt()
        .setExpirationTime(`${maxAge}s`)
        .encrypt(secretKey);

      return jwe;
    })(),
    (error) => new EncryptUserSessionPayloadError({ cause: error }),
  );
}
