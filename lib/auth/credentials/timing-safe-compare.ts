import "server-only";
import { timingSafeEqual } from "node:crypto";
import { Effect, Data } from "effect";

class InvalidTokenTypeError extends Data.TaggedError("InvalidTokenTypeError")<{
  operation: string;
  cause: string;
}> {}

class TokenLengthMismatchError extends Data.TaggedError(
  "TokenLengthMismatchError"
)<{
  operation: string;
  expectedLength: number;
  actualLength: number;
}> {}

class TokenMismatchError extends Data.TaggedError("TokenMismatchError")<{
  operation: string;
  cause: string;
}> {}

export function timingSafeCompare(a: string, b: string) {
  return Effect.gen(function* () {
    if (typeof a !== "string" || typeof b !== "string") {
      return yield* Effect.fail(
        new InvalidTokenTypeError({
          operation: "timingSafeCompare",
          cause: "Both inputs must be strings",
        })
      );
    }

    if (a.length !== b.length) {
      return yield* Effect.fail(
        new TokenLengthMismatchError({
          operation: "timingSafeCompare",
          expectedLength: b.length,
          actualLength: a.length,
        })
      );
    }

    const isEqual = timingSafeEqual(Buffer.from(a), Buffer.from(b));

    if (!isEqual) {
      return yield* Effect.fail(
        new TokenMismatchError({
          operation: "timingSafeCompare",
          cause: "Tokens do not match",
        })
      );
    }

    // More explicit about returning void
    return yield* Effect.void;
  }).pipe(
    Effect.tapErrorTag("InvalidTokenTypeError", (error) =>
      Effect.logError(error)
    ),
    Effect.tapErrorTag("TokenLengthMismatchError", (error) =>
      Effect.logError(error)
    ),
    Effect.tapErrorTag("TokenMismatchError", (error) => Effect.logError(error))
  );
}
