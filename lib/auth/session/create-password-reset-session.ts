import "server-only";

import { cookies } from "next/headers";
import { Effect, Data } from "effect";
import { encrypt } from "@/lib/auth/session/encrypt";

class PasswordResetSessionCreationError extends Data.TaggedError(
  "PasswordResetSessionCreationError"
)<{
  operation: string;
  cause: unknown;
}> {}

/************************************************
 *
 * Create password reset session
 *
 ************************************************/

export function createPasswordResetSession(email: string, token: string) {
  return Effect.gen(function* () {
    // Encrypt the session data
    const sessionData = yield* encrypt({
      email,
      token,
    });

    // Set the cookie
    yield* Effect.tryPromise({
      try: async () => {
        const cookieStore = await cookies();

        cookieStore.set({
          name: "password-reset-session",
          value: sessionData,
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          maxAge: 60 * 60, // 1 hour in seconds
          sameSite: "lax",
          path: "/",
        });
      },
      catch: (error) =>
        new PasswordResetSessionCreationError({
          operation: "createPasswordResetSession",
          cause: error,
        }),
    });
  }).pipe(
    Effect.tapErrorTag("ConfigError", (error) => Effect.logError(error)),
    Effect.tapErrorTag("EncryptionError", (error) => Effect.logError(error)),
    Effect.tapErrorTag("PasswordResetSessionCreationError", (error) =>
      Effect.logError(error)
    )
  );
}
