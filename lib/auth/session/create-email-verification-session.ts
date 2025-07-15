import "server-only";

import { Effect, Data } from "effect";
import { encrypt } from "@/lib/auth/session/encrypt";
import { cookies } from "next/headers";

class EmailVerificationSessionCreationError extends Data.TaggedError(
  "EmailVerificationSessionCreationError"
)<{ operation: string; cause: unknown }> {}

export function createEmailVerificationSession(
  email: string,
  hashedPassword: string,
  token: string
) {
  return Effect.gen(function* () {
    const sessionData = yield* encrypt({ email, hashedPassword, token });

    yield* Effect.tryPromise({
      try: async () => {
        const cookieStore = await cookies();
        cookieStore.set({
          name: "email-verification-session",
          value: sessionData,
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          maxAge: 60 * 60, // 1 hour in seconds
          sameSite: "lax",
          path: "/",
        });
      },
      catch: (error) =>
        new EmailVerificationSessionCreationError({
          operation: "createEmailVerificationSession",
          cause: error,
        }),
    });
  }).pipe(
    Effect.tapErrorTag("ConfigError", (error) => Effect.logError(error)),
    Effect.tapErrorTag("EncryptionError", (error) => Effect.logError(error)),
    Effect.tapErrorTag("EmailVerificationSessionCreationError", (error) =>
      Effect.logError(error)
    )
  );
}
