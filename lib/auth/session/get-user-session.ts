import "server-only";

import { cookies } from "next/headers";
import { Effect, Data, Console } from "effect";
import { decrypt } from "@/lib/auth/session/decrypt";
import { UserSessionSchema } from "@/lib/auth/schema";

class CookieStoreError extends Data.TaggedError("CookieStoreError")<{
  operation: string;
  cause: unknown;
}> {}

class UserSessionNotFoundError extends Data.TaggedError(
  "UserSessionNotFoundError"
)<{
  operation: string;
  cause: unknown;
}> {}

/************************************************
 *
 * Get user session
 *
 ************************************************/

export function getUserSession() {
  return Effect.gen(function* () {
    const cookieStore = yield* Effect.tryPromise({
      try: async () => await cookies(),
      catch: (error) =>
        new CookieStoreError({
          operation: "getUserSession",
          cause: error,
        }),
    });

    const sessionCookie = cookieStore.get("user-session");

    if (!sessionCookie) {
      return yield* Effect.fail(
        new UserSessionNotFoundError({
          operation: "getUserSession",
          cause: "Session cookie not found",
        })
      );
    }

    const user = yield* decrypt(sessionCookie.value, UserSessionSchema);

    return user;
  }).pipe(
    Effect.tapErrorTag("CookieStoreError", (error) => Console.error(error)),
    Effect.tapErrorTag("UserSessionNotFoundError", (error) =>
      Console.error(error)
    ),
    Effect.tapErrorTag("ConfigError", (error) => Console.error(error)),
    Effect.tapErrorTag("DecryptionError", (error) => Console.error(error))
  );
}
