import "server-only";

import { subtle } from "uncrypto";
import { base64url } from "jose";
import { Effect, Data, Console } from "effect";

class CodeChallengeGenerationError extends Data.TaggedError(
  "CodeChallengeGenerationError"
)<{
  operation: string;
  cause: unknown;
}> {}

export function generateS256CodeChallenge(codeVerifier: string) {
  return Effect.gen(function* () {
    const encoder = new TextEncoder();
    const data = encoder.encode(codeVerifier);

    const hash = yield* Effect.tryPromise({
      try: async () => await subtle.digest("SHA-256", data),
      catch: (error) =>
        new CodeChallengeGenerationError({
          operation: "generateS256CodeChallenge",
          cause: error,
        }),
    });
    return base64url.encode(new Uint8Array(hash));
  }).pipe(
    Effect.tapErrorTag("CodeChallengeGenerationError", (error) =>
      Console.error(error)
    )
  );
}
