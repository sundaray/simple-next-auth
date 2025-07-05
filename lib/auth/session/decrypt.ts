import "server-only";

import { base64url, jwtDecrypt } from "jose";
import { Effect, Data, Console, Config, Schema } from "effect";
import { validate } from "effect/Config";

class DecryptionError extends Data.TaggedError("DecryptionError")<{
  operation: string;
  cause: unknown;
}> {}

class InvalidJWTPayloadError extends Data.TaggedError(
  "InvalidJWTPayloadError"
)<{
  operation: string;
  cause: unknown;
}> {}

/************************************************
 *
 * JWT Secret Configuration
 *
 ************************************************/

const jwtKey = Config.string("JWT_ENCRYPTION_KEY").pipe(
  Config.mapAttempt((key) => base64url.decode(key))
);

/************************************************
 *
 * Decrypt JWT
 *
 ************************************************/

export function decrypt(jwt: string, schema) {
  return Effect.gen(function* () {
    // Load the secret using Config
    const key = yield* jwtKey;

    // 1. Decrypt the JWT
    const { payload } = yield* Effect.tryPromise({
      try: async () => await jwtDecrypt(jwt, key),
      catch: (error) =>
        new DecryptionError({
          operation: "decrypt",
          cause: error,
        }),
    });

    // 2. Validate the payload using the provided schema
    const validatedPayload = yield* Schema.decodeUnknown(schema)(payload).pipe(
      Effect.mapError(
        (error) =>
          new InvalidJWTPayloadError({
            operation: "decrypt",
            cause: error,
          })
      )
    );

    return validatedPayload;
  }).pipe(
    Effect.tapErrorTag("ConfigError", (error) => Console.error(error)),
    Effect.tapErrorTag("DecryptionError", (error) => Console.error(error)),
    Effect.tapErrorTag("InvalidJWTPayloadError", (error) =>
      Console.error(error)
    )
  );
}
