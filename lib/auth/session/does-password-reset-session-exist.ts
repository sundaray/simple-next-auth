import "server-only";

import { cookies } from "next/headers";
import { Effect, Data } from "effect";

class CookieStoreAccessError extends Data.TaggedError(
  "CookieStoreAccessError"
)<{
  operation: string;
  cause: unknown;
}> {}

class PasswordResetSessionNotFoundError extends Data.TaggedError(
  "PasswordResetSessionNotFoundError"
)<{
  operation: string;
  message: string;
}> {}

/************************************************
 *
 * Ensure password reset session exists
 *
 ************************************************/

export function ensurePasswordResetSessionExists() {
  return Effect.gen(function* () {
    const cookieStore = yield* Effect.tryPromise({
      try: async () => await cookies(),
      catch: (error) =>
        new CookieStoreAccessError({
          operation: "ensurePasswordResetSessionExists",
          cause: error,
        }),
    });

    if (!cookieStore.has("password-reset-session")) {
      yield* Effect.fail(
        new PasswordResetSessionNotFoundError({
          operation: "ensurePasswordResetSessionExists",
          message: "Password reset session not found",
        })
      );
    }
  }).pipe(
    Effect.tapErrorTag("CookieStoreAccessError", (error) =>
      Effect.logError(error)
    ),
    Effect.tapErrorTag("PasswordResetSessionNotFoundError", (error) =>
      Effect.logError(error)
    )
  );
}
