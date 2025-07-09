import "server-only";

import { cookies } from "next/headers";
import { Effect, Data, Option } from "effect";
import { decrypt } from "@/lib/auth/session/decrypt";
import { PasswordResetSessionSchema } from "@/lib/schema"; // Assuming this schema exists

class CookieStoreAccessError extends Data.TaggedError(
  "CookieStoreAccessError"
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
      return Option.none();
    }

    const decryptionEffect = decrypt(session.value, PasswordResetSessionSchema);

    const passwordResetOption = yield* decryptionEffect.pipe(
      Effect.tapErrorCause((cause) =>
        Effect.logError("Failed to decrypt password reset session: ", {
          operation: "getPasswordResetSession",
          cause,
        })
      ),
      Effect.option
    );

    return passwordResetOption;
  }).pipe(
    Effect.tapErrorTag("CookieStoreAccessError", (error) =>
      Effect.logError(error)
    )
  );
}
