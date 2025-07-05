import "server-only";

import { cookies } from "next/headers";
import { Effect, Data, Console } from "effect";
import { encrypt } from "@/lib/auth/session";

class StoreOAuthStateError extends Data.TaggedError("StoreOAuthStateError")<{
  operation: string;
  cause: unknown;
}> {}

/************************************************
 *
 * Store OAuth state in cookies
 *
 ************************************************/

export function storeOAuthState(
  state: string,
  codeVerifier: string,
  redirect: string
) {
  return Effect.gen(function* () {
    // Encrypt the OAuth state data
    const encryptedOAuthState = yield* encrypt({
      state,
      codeVerifier,
      redirect,
    });

    // Get cookie store and set the cookie
    yield* Effect.tryPromise({
      try: async () => {
        const cookieStore = await cookies();

        cookieStore.set("google_oauth_state", encryptedOAuthState, {
          path: "/",
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          maxAge: 60 * 10, // 10 minutes in seconds
          sameSite: "lax",
        });
      },
      catch: (error) =>
        new StoreOAuthStateError({
          operation: "storeOAuthState",
          cause: error,
        }),
    });
  }).pipe(
    Effect.tapErrorTag("ConfigError", (error) => Console.error(error)),
    Effect.tapErrorTag("EncryptionError", (error) => Console.error(error)),
    Effect.tapErrorTag("StoreOAuthStateError", (error) => Console.error(error))
  );
}
