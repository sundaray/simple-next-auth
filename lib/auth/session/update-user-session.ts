import "server-only";

import { encrypt } from "@/lib/auth/session/encrypt";
import { decrypt } from "@/lib/auth/session/decrypt";
import { Effect, Console } from "effect";

/************************************************
 *
 * Update user session (refresh token)
 *
 ************************************************/

export function updateUserSession(token: string) {
  return Effect.gen(function* () {
    // Decrypt the existing token
    const payload = yield* decrypt(token);

    // Re-encrypt with fresh expiration
    const updatedToken = yield* encrypt(payload);

    return updatedToken;
  }).pipe(
    Effect.tapErrorTag("ConfigError", (error) => Console.error(error)),
    Effect.tapErrorTag("EncryptionError", (error) => Console.error(error)),
    Effect.tapErrorTag("DecryptionError", (error) => Console.error(error))
  );
}
