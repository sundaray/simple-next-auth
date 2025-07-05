import "server-only";

import { cookies } from "next/headers";
import { encrypt } from "@/lib/auth/session/encrypt";
import { Effect, Data, Console } from "effect";

class UserSessionCreationError extends Data.TaggedError(
  "UserSessionCreationError"
)<{
  operation: string;
  cause: unknown;
}> {}

/************************************************
 *
 * Create user session
 *
 ************************************************/

export function createUserSession(email: string, role: string) {
  return Effect.gen(function* () {
    // Encrypt the session data
    const sessionData = yield* encrypt({
      email,
      role,
    });

    // Set the cookie
    yield* Effect.tryPromise({
      try: async () => {
        const cookieStore = await cookies();

        cookieStore.set({
          name: "user-session",
          value: sessionData,
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          maxAge: 60 * 60, // 1 hour in seconds
          sameSite: "lax",
          path: "/",
        });
      },
      catch: (error) =>
        new UserSessionCreationError({
          operation: "createUserSession",
          cause: error,
        }),
    });
  }).pipe(
    Effect.tapErrorTag("ConfigError", (error) => Console.error(error)),
    Effect.tapErrorTag("EncryptionError", (error) => Console.error(error)),
    Effect.tapErrorTag("UserSessionCreationError", (error) =>
      Console.error(error)
    )
  );
}
