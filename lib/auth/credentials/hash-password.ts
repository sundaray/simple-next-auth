import "server-only";

import { Effect, Data } from "effect";
import { hash } from "@node-rs/argon2";

/************************************************
 *
 * Hash user password
 *
 ************************************************/

class PasswordHashingError extends Data.TaggedError("PasswordHashingError")<{
  operation: string;
  cause: unknown;
}> {}
export function hashPassword(password: string) {
  return Effect.gen(function* () {
    const hashedPassword = yield* Effect.tryPromise({
      try: async () => await hash(password),
      catch: (error) =>
        new PasswordHashingError({ operation: "hashPassword", cause: error }),
    });

    return hashedPassword;
  }).pipe(
    Effect.tapErrorTag("PasswordHashingError", (error) =>
      Effect.logError(error)
    )
  );
}
