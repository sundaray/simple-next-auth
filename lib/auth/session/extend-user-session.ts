import "server-only";

import { encrypt } from "@/lib/auth/session/encrypt";
import { decrypt } from "@/lib/auth/session/decrypt";
import { Effect } from "effect";
import { UserSessionSchema } from "@/lib/schema";

/************************************************
 *
 * Update user session (refresh token)
 *
 ************************************************/

export function extendUserSession(token: string) {
  return Effect.gen(function* () {
    // Decrypt the existing token
    const payload = yield* decrypt(token, UserSessionSchema);

    // Re-encrypt with fresh expiration
    const updatedToken = yield* encrypt(payload);

    return updatedToken;
  }).pipe(
    Effect.tapErrorTag("ConfigError", (error) => Effect.logError(error)),
    Effect.tapErrorTag("EncryptionError", (error) => Effect.logError(error)),
    Effect.tapErrorTag("DecryptionError", (error) => Effect.logError(error)),
    Effect.tapErrorTag("InvalidJWTPayloadError", (error) =>
      Effect.logError(error)
    )
  );
}
