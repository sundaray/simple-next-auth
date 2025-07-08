import "server-only";

import { cookies } from "next/headers";
import { Effect, Data } from "effect";
import { decrypt } from "@/lib/auth/session/decrypt";
import { PasswordResetSessionSchema } from "@/lib/schema";

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
  cause: unknown;
}> {}

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
        new CookieStoreAccessError({
          operation: "getPasswordResetSession",
          cause: error,
        }),
    });

    const session = cookieStore.get("password-reset-session");

    if (!session) {
      return yield* Effect.fail(
        new PasswordResetSessionNotFoundError({
          operation: "getPasswordResetSession",
          cause: "Password reset session not found",
        })
      );
    }

    const sessionData = yield* decrypt(
      session.value,
      PasswordResetSessionSchema
    );

    return sessionData;
  }).pipe(
    Effect.tapErrorTag("CookieStoreAccessError", (error) =>
      Effect.logError(error)
    ),
    Effect.tapErrorTag("PasswordResetSessionNotFoundError", (error) =>
      Effect.logError(error)
    )
  );
}
