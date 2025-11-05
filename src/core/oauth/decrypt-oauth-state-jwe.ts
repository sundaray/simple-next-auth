import { jwtDecrypt } from 'jose';
import { ResultAsync } from 'neverthrow';
import { DecryptOAuthStateJweError } from '../errors';
import type { OAuthStatePayload } from '../../types';

export interface DecryptOAuthStateJWEParams {
  jwe: string;
  secret: string;
}

export function decryptOAuthStateJWE(
  params: DecryptOAuthStateJWEParams,
): ResultAsync<OAuthStatePayload, DecryptOAuthStateJweError> {
  const { jwe, secret } = params;
  const secretKey = new TextEncoder().encode(secret);

  return ResultAsync.fromPromise(
    (async () => {
      const { payload } = await jwtDecrypt(jwe, secretKey);
      return payload.oauthState as OAuthStatePayload;
    })(),
    (error) => new DecryptOAuthStateJweError({ cause: error }),
  );
}
