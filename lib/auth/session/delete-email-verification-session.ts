import "server-only";

import { cookies } from "next/headers";
import { Effect, Data, Console } from "effect";

class EmailVerificationSessionDeletionError extends Data.TaggedError(
  "EmailVerificationSessionDeletionError"
)<{
  operation: string;
  cause: unknown;
}> {}

/************************************************
 *
 * Delete the email verification session
 *
 ************************************************/

export function deleteEmailVerificationSession() {
  return Effect.gen(function* () {
    yield* Effect.tryPromise({
      try: async () => {
        const cookieStore = await cookies();
        cookieStore.delete("email-verification-session");
      },
      catch: (error) =>
        new EmailVerificationSessionDeletionError({
          operation: "deleteEmailVerificationSession",
          cause: error,
        }),
    });
  }).pipe(
    Effect.tapErrorTag("EmailVerificationSessionDeletionError", (error) =>
      Console.error(error)
    )
  );
}
