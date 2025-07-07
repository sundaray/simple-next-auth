import "server-only";

import { cookies } from "next/headers";
import { Effect, Data, Console } from "effect";
import { decrypt } from "@/lib/auth/session/decrypt";
import { UserSessionSchema } from "@/lib/auth/schema";

class CookieStoreAccessError extends Data.TaggedError(
  "CookieStoreAccessError"
)<{
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
        new CookieStoreAccessError({
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

    return yield* decrypt(sessionCookie.value, UserSessionSchema);
  }).pipe(
    Effect.tapErrorTag("CookieStoreAccessError", (error) =>
      Console.error(error)
    ),
    Effect.tapErrorTag("UserSessionNotFoundError", (error) =>
      Console.error(error)
    ),
    Effect.tapErrorTag("ConfigError", (error) => Console.error(error)),
    Effect.tapErrorTag("DecryptionError", (error) => Console.error(error))
  );
}
