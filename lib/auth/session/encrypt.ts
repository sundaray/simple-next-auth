import "server-only";

import type { JWTPayload } from "jose";
import { base64url, EncryptJWT } from "jose";
import { Effect, Data, Console, Config } from "effect";

class EncryptionError extends Data.TaggedError("EncryptionError")<{
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

export function encrypt<T extends JWTPayload>(payload: T) {
  return Effect.gen(function* () {
    const key = yield* jwtKey;

    const encryptedJWT = yield* Effect.tryPromise({
      try: async () =>
        await new EncryptJWT(payload)
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
    Effect.tapErrorTag("ConfigError", (error) => Console.error(error)),

    Effect.tapErrorTag("EncryptionError", (error) => Console.error(error))
  );
}
