import { NextRequest, NextResponse } from "next/server";
import { Effect, Data, Option } from "effect";

import { getPasswordResetSession } from "@/lib/auth/session/get-password-reset-session";
import { timingSafeCompare } from "@/lib/auth/credentials/timing-safe-compare";

class MissingTokenQueryParameterError extends Data.TaggedError(
  "MissingTokenQueryParameterError"
)<{
  operation: string;
  cause: string;
}> {}

class InvalidPasswordResetSessionError extends Data.TaggedError(
  "InvalidPasswordResetSessionError"
)<{
  operation: string;
  cause: string;
}> {}

/************************************************
 *
 * Route Handler
 *
 ************************************************/

export async function GET(request: NextRequest) {
  const url = request.nextUrl;

  const program = Effect.gen(function* () {
    const tokenFromUrl = url.searchParams.get("token");

    if (!tokenFromUrl) {
      return yield* Effect.fail(
        new MissingTokenQueryParameterError({
          operation: "GET /api/auth/verify-password-reset",
          cause: "Missing token query parameter",
        })
      );
    }

    const sessionOption = yield* getPasswordResetSession();

    if (Option.isNone(sessionOption)) {
      return yield* Effect.fail(
        new InvalidPasswordResetSessionError({
          operation: "GET /api/auth/verify-password-reset",
          cause: "Password reset session is not found or is invalid.",
        })
      );
    }
    const { token: tokenFromSession } = sessionOption.value;

    yield* timingSafeCompare(tokenFromUrl, tokenFromSession);

    return new URL("/reset-password", url);
  });

  const handledProgram = program.pipe(
    // First, tap the error channel to log any failure cause for debugging
    Effect.tapErrorCause((cause) =>
      Effect.logError("Password reset verification failed", cause)
    ),
    // Now, handle both success and failure to create the final response
    Effect.matchEffect({
      onFailure: (error) => {
        const authErrorUrl = new URL("/forgot-password/error", url);

        // Add the error tag as a query parameter
        const errorTag = "_tag" in error ? error._tag : "UnknownError";
        authErrorUrl.searchParams.set("error", errorTag);

        // Return a successful effect containing the redirect response
        return Effect.succeed(NextResponse.redirect(authErrorUrl));
      },
      onSuccess: (redirectUrl) => {
        // On success, redirect to the reset password page
        return Effect.succeed(NextResponse.redirect(redirectUrl));
      },
    })
  );

  return Effect.runPromise(handledProgram);
}
