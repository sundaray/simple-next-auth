import "server-only";

import { Effect, Data, Config } from "effect";
import { encodeClientCredentials } from "@/lib/auth/google/encode-client-credentials";

const tokenEndpoint = "https://oauth2.googleapis.com/token";

class GoogleTokenFetchError extends Data.TaggedError("GoogleTokenFetchError")<{
  operation: string;
  cause: unknown;
}> {}

class GoogleTokenResponseError extends Data.TaggedError(
  "GoogleTokenResponseError"
)<{
  operation: string;
  cause: unknown;
}> {}

class GoogleTokenParseError extends Data.TaggedError("GoogleTokenParseError")<{
  operation: string;
  cause: unknown;
}> {}

export function exchangeAuthorizationCodeForTokens(
  code: string,
  codeVerifier: string
) {
  return Effect.gen(function* () {
    const clientId = yield* Config.string("GOOGLE_CLIENT_ID");
    const redirectUri = yield* Config.string("REDIRECT_URI");

    const encodedCredentials = yield* encodeClientCredentials();

    const response = yield* Effect.tryPromise({
      try: () =>
        fetch(tokenEndpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Accept: "application/json",
            Authorization: `Basic ${encodedCredentials}`,
          },
          body: new URLSearchParams({
            code,
            code_verifier: codeVerifier,
            grant_type: "authorization_code",
            client_id: clientId,
            redirect_uri: redirectUri,
          }),
        }),
      catch: (error) =>
        new GoogleTokenFetchError({
          operation: "exchangeGoogleCodeForTokens",
          cause: error,
        }),
    });

    if (!response.ok) {
      return yield* Effect.fail(
        new GoogleTokenResponseError({
          operation: "exchangeGoogleCodeForTokens",
          cause: `HTTP ${response.status}: ${response.statusText}`,
        })
      );
    }

    const tokenData = yield* Effect.tryPromise({
      try: async () => await response.json(),
      catch: (error) =>
        new GoogleTokenParseError({
          operation: "parseGoogleTokenResponse",
          cause: error,
        }),
    });

    return tokenData;
  }).pipe(
    Effect.tapErrorTag("ConfigError", (error) => Effect.logError(error)),
    Effect.tapErrorTag("ClientCredentialsEncodingError", (error) =>
      Effect.logError(error)
    ),
    Effect.tapErrorTag("GoogleTokenFetchError", (error) =>
      Effect.logError(error)
    ),
    Effect.tapErrorTag("GoogleTokenResponseError", (error) =>
      Effect.logError(error)
    ),
    Effect.tapErrorTag("GoogleTokenParseError", (error) =>
      Effect.logError(error)
    )
  );
}
