import { EncryptJWT } from 'jose';
import { ResultAsync } from 'neverthrow';
import { EncryptOAuthStatePayloadError } from './errors';
import type { OAuthStatePayload } from './types';
import { Buffer } from 'node:buffer';

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

      // Decode the base64 secret to get the raw bytes
      const secretKey = Buffer.from(secret, 'base64');

      const jwe = await new EncryptJWT({ oauthState })
        .setProtectedHeader({ alg: 'dir', enc: 'A128CBC-HS256' })
        .setIssuedAt()
        .setExpirationTime(`${maxAge}s`)
        .encrypt(secretKey);

      return jwe;
    })(),
    (error) => new EncryptOAuthStatePayloadError({ cause: error }),
  );
}
