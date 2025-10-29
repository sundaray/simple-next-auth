import { ResultAsync, ok, err, Result, errAsync } from 'neverthrow';
import { base64url } from 'jose';
import { z } from 'zod';
import type { ZodError } from 'zod';

// ============================================
// ZOD SCHEMA
// ============================================

/**
 * Zod schema for Google's token response
 */
const GoogleTokenResponseSchema = z.object({
  access_token: z.string(),
  id_token: z.string(),
  expires_in: z.number(),
  token_type: z.string(),
  scope: z.string(),
  refresh_token: z.string().optional(),
});

export type GoogleTokenResponse = z.infer<typeof GoogleTokenResponseSchema>;

// ============================================
// ERROR TYPES
// ============================================

type ClientCredentialsEncodingError = {
  type: 'CLIENT_CREDENTIALS_ENCODING_ERROR';
  message: string;
  cause?: unknown;
};

type TokenFetchError = {
  type: 'TOKEN_FETCH_ERROR';
  message: string;
  cause?: unknown;
};

type TokenResponseError = {
  type: 'TOKEN_RESPONSE_ERROR';
  message: string;
  status: number;
  statusText: string;
};

type TokenParseError = {
  type: 'TOKEN_PARSE_ERROR';
  message: string;
  cause?: unknown;
};

type InvalidTokenDataError = {
  type: 'INVALID_TOKEN_DATA';
  message: string;
  cause: ZodError;
};

export type ExchangeCodeForTokensError =
  | ClientCredentialsEncodingError
  | TokenFetchError
  | TokenResponseError
  | TokenParseError
  | InvalidTokenDataError;

// ============================================
// TYPES
// ============================================

export interface ExchangeCodeForTokensParams {
  code: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  codeVerifier: string;
}

// ============================================
// ENCODE CLIENT CREDENTIALS
// ============================================

/**
 * Encodes client credentials for Basic authentication.
 */
function encodeClientCredentials(
  clientId: string,
  clientSecret: string,
): Result<string, ClientCredentialsEncodingError> {
  return Result.fromThrowable(
    () => {
      const bytes = new TextEncoder().encode(`${clientId}:${clientSecret}`);
      return base64url.encode(bytes);
    },
    (error): ClientCredentialsEncodingError => ({
      type: 'CLIENT_CREDENTIALS_ENCODING_ERROR',
      message: 'Failed to encode client credentials',
      cause: error,
    }),
  )();
}

// ============================================
// GOOGLE TOKEN ENDPOINT
// ============================================

const GOOGLE_TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token';

// ============================================
// EXCHANGE CODE FOR TOKENS
// ============================================

/**
 * Exchanges an authorization code for tokens from Google.
 */
export function exchangeCodeForTokens(
  params: ExchangeCodeForTokensParams,
): ResultAsync<GoogleTokenResponse, ExchangeCodeForTokensError> {
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
      (error): TokenFetchError => ({
        type: 'TOKEN_FETCH_ERROR',
        message: 'Failed to fetch tokens from Google',
        cause: error,
      }),
    )
      // Check if response is ok
      .andThen((response) => {
        if (!response.ok) {
          return err({
            type: 'TOKEN_RESPONSE_ERROR',
            message: `Google token endpoint returned error`,
            status: response.status,
            statusText: response.statusText,
          } as TokenResponseError);
        }
        return ok(response);
      })
      // Parse JSON response
      .andThen((response) =>
        ResultAsync.fromPromise(
          response.json(),
          (error): TokenParseError => ({
            type: 'TOKEN_PARSE_ERROR',
            message: 'Failed to parse token response',
            cause: error,
          }),
        ),
      )
      // Validate response structure with Zod
      .andThen((json) => {
        const parseResult = GoogleTokenResponseSchema.safeParse(json);

        if (parseResult.success) {
          return ok(parseResult.data);
        } else {
          return err({
            type: 'INVALID_TOKEN_DATA',
            message: `Invalid token response structure: ${parseResult.error.message}`,
            cause: parseResult.error,
          } as InvalidTokenDataError);
        }
      })
  );
}
