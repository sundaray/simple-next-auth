import "server-only";

import { base64url } from "jose";
import { getRandomValues } from "uncrypto";
import { Effect, Data } from "effect";

class TokenGenerationError extends Data.TaggedError("TokenGenerationError")<{
  operation: string;
  cause: unknown;
}> {}

/************************************************
 *
 * Create password reset verification token
 *
 ************************************************/

export function createPasswordResetToken() {
  return Effect.try({
    try: () => {
      const randomValues = new Uint8Array(32);
      getRandomValues(randomValues);
      return base64url.encode(randomValues);
    },
    catch: (error) =>
      new TokenGenerationError({
        operation: "createPasswordResetToken",
        cause: error,
      }),
  }).pipe(
    Effect.tapErrorTag("TokenGenerationError", (error) =>
      Effect.logError(error)
    )
  );
}
