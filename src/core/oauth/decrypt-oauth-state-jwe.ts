import { jwtDecrypt } from 'jose';
import { ResultAsync } from 'neverthrow';
import { DecryptOAuthStateJweError } from './errors';
import type { OAuthStatePayload } from './index';
import { Buffer } from 'node:buffer';

export interface DecryptOAuthStateJWEParams {
  jwe: string;
  secret: string;
}

export function decryptOAuthStateJWE(
  params: DecryptOAuthStateJWEParams,
): ResultAsync<OAuthStatePayload, DecryptOAuthStateJweError> {
  const { jwe, secret } = params;

  // Decode the base64 secret to get the raw bytes
  const secretKey = Buffer.from(secret, 'base64');

  return ResultAsync.fromPromise(
    (async () => {
      const { payload } = await jwtDecrypt(jwe, secretKey);
      return payload.oauthState as OAuthStatePayload;
    })(),
    (error) => new DecryptOAuthStateJweError({ cause: error }),
  );
}
