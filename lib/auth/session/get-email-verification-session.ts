import "server-only";

import { cookies } from "next/headers";
import { Effect, Data, Option } from "effect"; // -> Added Option
import { decrypt } from "@/lib/auth/session/decrypt";
import { EmailVerificationSessionSchema } from "@/lib/schema";

class CookieStoreAccessError extends Data.TaggedError(
  "CookieStoreAccessError"
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
      return Option.none();
    }

    const decryptionEffect = decrypt(
      session.value,
      EmailVerificationSessionSchema
    );

    const verificationSessionOption = yield* decryptionEffect.pipe(
      Effect.tapErrorCause((cause) =>
        Effect.logError("Failed to decrypt email verification session: ", {
          operation: "getEmailVerificationSession",
          cause,
        })
      ),
      // Effect.option converts Success -> Some(A) and Failure -> None
      Effect.option
    );

    return verificationSessionOption;
  }).pipe(
    Effect.tapErrorTag("CookieStoreAccessError", (error) =>
      Effect.logError("Cookie store access failed", error)
    )
  );
}
