import "server-only";

import { base64url } from "jose";
import { getRandomValues } from "uncrypto";
import { Effect, Data } from "effect";

class StateGenerationError extends Data.TaggedError("StateGenerationError")<{
  operation: string;
  cause: unknown;
}> {}

export function generateState() {
  return Effect.try({
    try: () => {
      const randomValues = new Uint8Array(32);
      getRandomValues(randomValues);
      return base64url.encode(randomValues);
    },
    catch: (error) =>
      new StateGenerationError({
        operation: "generateState",
        cause: error,
      }),
  }).pipe(
    Effect.tapErrorTag("StateGenerationError", (error) =>
      Effect.logError(error)
    )
  );
}
