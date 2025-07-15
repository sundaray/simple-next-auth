import "server-only";

import { base64url, EncryptJWT } from "jose";
import { Effect, Data, Config, Schema } from "effect";
import { EncryptableSessionSchema, EncryptableSession } from "@/lib/schema";

class EncryptionError extends Data.TaggedError("EncryptionError")<{
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
 * Encrypt a payload object to a JWE token
 *
 ************************************************/

export function encrypt(payload: EncryptableSession) {
  return Effect.gen(function* () {
    // 1. Validate the payload against the provided schema
    const validatedPayload = yield* Schema.encode(EncryptableSessionSchema)(
      payload
    ).pipe(
      Effect.mapError(
        (error) =>
          new InvalidJWTPayloadError({
            operation: "encrypt",
            cause: error,
          })
      )
    );
    const key = yield* jwtKey;

    const encryptedJWT = yield* Effect.tryPromise({
      try: async () =>
        await new EncryptJWT(validatedPayload)
          .setProtectedHeader({ alg: "dir", enc: "A128CBC-HS256" })
          .setExpirationTime("1hr")
          .encrypt(key),
      catch: (error) =>
        new EncryptionError({
          operation: "encrypt",
          cause: error,
        }),
    });

    return encryptedJWT;
  }).pipe(
    Effect.tapErrorTag("ConfigError", (error) => Effect.logError(error)),
    Effect.tapErrorTag("EncryptionError", (error) => Effect.logError(error)),
    Effect.tapErrorTag("InvalidJWTPayloadError", (error) =>
      Effect.logError(error)
    )
  );
}
