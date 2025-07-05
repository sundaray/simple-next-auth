import "server-only";
import { base64url } from "jose";
import { Effect, Data, Config, Console } from "effect";

class ClientCredentialsEncodingError extends Data.TaggedError(
  "ClientCredentialsEncodingError"
)<{
  operation: string;
  cause: unknown;
}> {}

export function encodeClientCredentials() {
  return Effect.gen(function* () {
    const clientId = yield* Config.string("GOOGLE_CLIENT_ID");
    const clientSecret = yield* Config.string("GOOGLE_CLIENT_SECRET");

    return yield* Effect.try({
      try: () => {
        const bytes = new TextEncoder().encode(`${clientId}:${clientSecret}`);
        return base64url.encode(bytes);
      },
      catch: (error) =>
        new ClientCredentialsEncodingError({
          operation: "encodeGoogleClientCredentials",
          cause: error,
        }),
    });
  }).pipe(
    Effect.tapErrorTag("ConfigError", (error) => Console.error(error)),
    Effect.tapErrorTag("ClientCredentialsEncodingError", (error) =>
      Console.error(error)
    )
  );
}
