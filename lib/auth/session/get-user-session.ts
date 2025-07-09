import "server-only";

import { cookies } from "next/headers";
import { Effect, Data, Option } from "effect";
import { decrypt } from "@/lib/auth/session/decrypt";
import { UserSessionSchema } from "@/lib/schema";

class CookieStoreAccessError extends Data.TaggedError(
  "CookieStoreAccessError"
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

    const session = cookieStore.get("user-session");

    if (!session) {
      return Option.none();
    }

    const decryptionEffect = decrypt(session.value, UserSessionSchema);

    const userOption = yield* decryptionEffect.pipe(
      Effect.tapErrorCause((cause) =>
        Effect.logError("Failed to decrypt user session: ", {
          operation: "getUserSession",
          cause,
        })
      ),
      Effect.option
    );

    return userOption;
  }).pipe(
    Effect.tapErrorTag("CookieStoreAccessError", (error) =>
      Effect.logError(error)
    )
  );
}
