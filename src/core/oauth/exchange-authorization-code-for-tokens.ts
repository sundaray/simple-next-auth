import { ResultAsync, ok, err, Result, errAsync } from 'neverthrow';
import { base64url } from 'jose';
import type { GoogleTokenResponse } from '../../types';

import {
  EncodeClientCredentialsError,
  TokenFetchError,
  TokenResponseError,
  TokenParseError,
} from '../errors';

// ============================================
// ENCODE CLIENT CREDENTIALS
// ============================================

function encodeClientCredentials(
  clientId: string,
  clientSecret: string,
): Result<string, EncodeClientCredentialsError> {
  return Result.fromThrowable(
    () => {
      const bytes = new TextEncoder().encode(`${clientId}:${clientSecret}`);
      return base64url.encode(bytes);
    },
    (error) => new EncodeClientCredentialsError({ cause: error }),
  )();
}

const GOOGLE_TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token';

// ============================================
// EXCHANGE AUTHORIZATION CODE FOR TOKENS
// ============================================

export interface ExchangeAuthorizationCodeForTokensParams {
  code: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  codeVerifier: string;
}

export type ExchangeAuthorizationCodeForTokensError =
  | EncodeClientCredentialsError
  | TokenFetchError
  | TokenResponseError
  | TokenParseError;

export function exchangeAuthorizationCodeForTokens(
  params: ExchangeAuthorizationCodeForTokensParams,
): ResultAsync<GoogleTokenResponse, ExchangeAuthorizationCodeForTokensError> {
  const { code, clientId, clientSecret, redirectUri, codeVerifier } = params;

  // Encode credentials for Basic auth
  const encodedCredentialsResult = encodeClientCredentials(
    clientId,
    clientSecret,
  );

  if (encodedCredentialsResult.isErr()) {
    return errAsync(encodedCredentialsResult.error);
  }
  const encodedCredentials = encodedCredentialsResult.value;

  // Build request body
  const body = new URLSearchParams({
    code,
    code_verifier: codeVerifier,
    grant_type: 'authorization_code',
    client_id: clientId,
    redirect_uri: redirectUri,
  });

  return (
    // Fetch tokens from Google
    ResultAsync.fromPromise(
      fetch(GOOGLE_TOKEN_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/json',
          Authorization: `Basic ${encodedCredentials}`,
        },
        body: body.toString(),
      }),
      (error) => new TokenFetchError({ cause: error }),
    )
      // Check if response is ok
      .andThen((response) => {
        if (!response.ok) {
          return err(
            new TokenResponseError({
              message: 'Google token endpoint returned an error',
              status: response.status,
              statusText: response.statusText,
            }),
          );
        }
        return ok(response);
      })
      // Parse JSON response
      .andThen((response) =>
        ResultAsync.fromPromise(
          response.json(),
          (error): TokenParseError => new TokenParseError({ cause: error }),
        ),
      )
  );
}
