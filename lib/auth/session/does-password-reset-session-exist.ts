import "server-only";

import { cookies } from "next/headers";
import { Effect, Data, Console } from "effect";

class PasswordResetSessionCheckError extends Data.TaggedError(
  "PasswordResetSessionCheckError"
)<{
  operation: string;
  cause: unknown;
}> {}

/************************************************
 *
 * Check if password reset session exists
 *
 ************************************************/

export function doesPasswordResetSessionExist() {
  return Effect.gen(function* () {
    const cookieStore = yield* Effect.tryPromise({
      try: async () => await cookies(),
      catch: (error) =>
        new PasswordResetSessionCheckError({
          operation: "doesPasswordResetSessionExist",
          cause: error,
        }),
    });

    return cookieStore.has("password-reset-session");
  }).pipe(
    Effect.tapErrorTag("PasswordResetSessionCheckError", (error) =>
      Console.error(error)
    )
  );
}
