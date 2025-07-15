import "server-only";

import { cookies } from "next/headers";
import { Effect, Data } from "effect";

class PasswordResetSessionDeletionError extends Data.TaggedError(
  "PasswordResetSessionDeletionError"
)<{
  operation: string;
  cause: unknown;
}> {}

/************************************************
 *
 * Delete password reset session
 *
 ************************************************/

export function deletePasswordResetSession() {
  return Effect.gen(function* () {
    yield* Effect.tryPromise({
      try: async () => {
        const cookieStore = await cookies();
        cookieStore.delete("password-reset-session");
      },
      catch: (error) =>
        new PasswordResetSessionDeletionError({
          operation: "deletePasswordResetSession",
          cause: error,
        }),
    });
  }).pipe(
    Effect.tapErrorTag("PasswordResetSessionDeletionError", (error) =>
      Effect.logError(error)
    )
  );
}
