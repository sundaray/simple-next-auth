import { EncryptJWT } from 'jose';
import { ResultAsync } from 'neverthrow';
import { EncryptOAuthStatePayloadError } from '../errors';
import type { OAuthStatePayload } from '../../types';

export interface EncryptOAuthStatePayloadParams {
  oauthState: OAuthStatePayload;
  secret: string;
  maxAge: number;
}

export function encryptOAuthStatePayload(
  params: EncryptOAuthStatePayloadParams,
): ResultAsync<string, EncryptOAuthStatePayloadError> {
  return ResultAsync.fromPromise(
    (async () => {
      const { oauthState, secret, maxAge } = params;

      const secretKey = new TextEncoder().encode(secret);

      const jwe = await new EncryptJWT({ oauthState })
        .setProtectedHeader({ alg: 'dir', enc: 'A256CBC-HS256' })
        .setIssuedAt()
        .setExpirationTime(`${maxAge}s`)
        .encrypt(secretKey);

      return jwe;
    })(),
    (error) => new EncryptOAuthStatePayloadError({ cause: error }),
  );
}
