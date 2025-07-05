import "server-only";

import { cookies } from "next/headers";
import { Effect, Data, Console } from "effect";

class EmailVerificationSessionCheckError extends Data.TaggedError(
  "EmailVerificationSessionCheckError"
)<{
  operation: string;
  cause: unknown;
}> {}

/************************************************
 *
 * Check if an email verification session exists
 *
 ************************************************/

export function doesEmailVerificationSessionExist() {
  return Effect.gen(function* () {
    const cookieStore = yield* Effect.tryPromise({
      try: async () => await cookies(),
      catch: (error) =>
        new EmailVerificationSessionCheckError({
          operation: "doesEmailVerificationSessionExist",
          cause: error,
        }),
    });

    return cookieStore.has("email-verification-session");
  }).pipe(
    Effect.tapErrorTag("EmailVerificationSessionCheckError", (error) =>
      Console.error(error)
    )
  );
}
