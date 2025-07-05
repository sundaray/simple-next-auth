import "server-only";

import { cookies } from "next/headers";
import { Effect, Data, Console } from "effect";
import { decrypt } from "@/lib/auth/session/decrypt";

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

    const sessionCookie = cookieStore.get("email-verification-session");

    if (!sessionCookie) {
      return yield* Effect.fail(
        new EmailVerificationSessionNotFoundError({
          operation: "getEmailVerificationSession",
          cause: "Email verification session cookie not found",
        })
      );
    }

    return yield* decrypt(sessionCookie.value);
  }).pipe(
    Effect.tapErrorTag("CookieStoreAccessError", (error) =>
      Console.error(error)
    ),
    Effect.tapErrorTag("EmailVerificationSessionNotFoundError", (error) =>
      Console.error(error)
    ),
    Effect.tapErrorTag("ConfigError", (error) => Console.error(error)),
    Effect.tapErrorTag("DecryptionError", (error) => Console.error(error))
  );
}
