import "server-only";

import { cookies } from "next/headers";
import { Effect, Data, Console } from "effect";
import { decrypt } from "@/lib/auth/session/decrypt";
import { EmailVerificationSessionSchema } from "@/lib/auth/schema";

class CookieStoreAccessError extends Data.TaggedError(
  "CookieStoreAccessError"
)<{
  operation: string;
  cause: unknown;
}> {}

class EmailVerificationSessionNotFoundError extends Data.TaggedError(
  "EmailVerificationSessionNotFoundError"
)<{
  operation: string;
  cause: unknown;
}> {}

/************************************************
 *
 * Get the email verification session
 *
 ************************************************/

export function getEmailVerificationSession() {
  return Effect.gen(function* () {
    const cookieStore = yield* Effect.tryPromise({
      try: async () => await cookies(),
      catch: (error) =>
        new CookieStoreAccessError({
          operation: "getEmailVerificationSession",
          cause: error,
        }),
    });

    const session = cookieStore.get("email-verification-session");

    if (!session) {
      return yield* Effect.fail(
        new EmailVerificationSessionNotFoundError({
          operation: "getEmailVerificationSession",
          cause: "Email verification session not found",
        })
      );
    }

    return yield* decrypt(session.value, EmailVerificationSessionSchema);
  }).pipe(
    Effect.tapErrorTag("CookieStoreAccessError", (error) =>
      Console.error(error)
    ),
    Effect.tapErrorTag("EmailVerificationSessionNotFoundError", (error) =>
      Console.error(error)
    )
  );
}
