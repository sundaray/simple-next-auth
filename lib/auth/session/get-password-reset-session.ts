import "server-only";

import { cookies } from "next/headers";
import { Effect, Data, Console } from "effect";
import { decrypt } from "@/lib/auth/session/decrypt";

class PasswordResetCookieStoreError extends Data.TaggedError(
  "PasswordResetCookieStoreError"
)<{
  operation: string;
  cause: unknown;
}> {}

class PasswordResetSessionNotFoundError extends Data.TaggedError(
  "PasswordResetSessionNotFoundError"
)<{
  operation: string;
  cause: unknown;
}> {}

type PasswordResetSession = {
  email: string;
  token: string;
};

/************************************************
 *
 * Get password reset session
 *
 ************************************************/

export function getPasswordResetSession() {
  return Effect.gen(function* () {
    const cookieStore = yield* Effect.tryPromise({
      try: async () => await cookies(),
      catch: (error) =>
        new PasswordResetCookieStoreError({
          operation: "getPasswordResetSession",
          cause: error,
        }),
    });

    const sessionCookie = cookieStore.get("password-reset-session");

    if (!sessionCookie) {
      return yield* Effect.fail(
        new PasswordResetSessionNotFoundError({
          operation: "getPasswordResetSession",
          cause: "Password reset session cookie not found",
        })
      );
    }

    const session = yield* decrypt(sessionCookie.value);

    return session;
  }).pipe(
    Effect.tapErrorTag("PasswordResetCookieStoreError", (error) =>
      Console.error(error)
    ),
    Effect.tapErrorTag("PasswordResetSessionNotFoundError", (error) =>
      Console.error(error)
    ),
    Effect.tapErrorTag("ConfigError", (error) => Console.error(error)),
    Effect.tapErrorTag("DecryptionError", (error) => Console.error(error))
  );
}
