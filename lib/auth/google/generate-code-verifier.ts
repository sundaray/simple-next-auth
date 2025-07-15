import "server-only";

import { base64url } from "jose";
import { getRandomValues } from "uncrypto";
import { Effect, Data } from "effect";

class CodeVerifierGenerationError extends Data.TaggedError(
  "CodeVerifierGenerationError"
)<{
  operation: string;
  cause: unknown;
}> {}

export function generateCodeVerifier() {
  return Effect.try({
    try: () => {
      const randomValues = new Uint8Array(32);
      getRandomValues(randomValues);
      return base64url.encode(randomValues);
    },
    catch: (error) =>
      new CodeVerifierGenerationError({
        operation: "generateCodeVerifier",
        cause: error,
      }),
  }).pipe(
    Effect.tapErrorTag("CodeVerifierGenerationError", (error) =>
      Effect.logError(error)
    )
  );
}
