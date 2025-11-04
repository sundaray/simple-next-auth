import { jwtDecrypt } from 'jose';
import { ResultAsync } from 'neverthrow';
import { DecryptOAuthStateJweError } from '../errors';
import type { OAuthStatePayload } from '../../types';

export interface DecryptOAuthStateJWEParams {
  jwt: string;
  secret: string;
}

export function decryptOAuthStateJWE(
  params: DecryptOAuthStateJWEParams,
): ResultAsync<OAuthStatePayload, DecryptOAuthStateJweError> {
  const { jwt, secret } = params;
  const secretKey = new TextEncoder().encode(secret);

  return ResultAsync.fromPromise(
    (async () => {
      const { payload } = await jwtDecrypt(jwt, secretKey);
      return payload.oauthState as OAuthStatePayload;
    })(),
    (error) => new DecryptOAuthStateJweError({ cause: error }),
  );
}
