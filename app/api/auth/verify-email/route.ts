import { NextRequest, NextResponse } from "next/server";
import { Effect, Data, Option } from "effect";

import { getEmailVerificationSession } from "@/lib/auth/session/get-email-verification-session";
import { deleteEmailVerificationSession } from "@/lib/auth/session/delete-email-verification-session";
import { assignUserRole } from "@/lib/auth/shared/assign-user-role";
import { createUserWithProvider } from "@/lib/auth/shared/create-user-with-provider";
import { timingSafeCompare } from "@/lib/auth/credentials/timing-safe-compare";


class MissingTokenQueryParameterError extends Data.TaggedError(
  "MissingTokenQueryParameterError"
)<{
  operation: string;
  cause: string;
}> {}

class InvalidEmailVerificationSessionError extends Data.TaggedError(
  "InvalidEmailVerificationSessionError"
)<{
  operation: string;
  cause: unknown;
}> {}

/************************************************
 *
 * Route Handler
 *
 ************************************************/

export async function GET(request: NextRequest) {
  const url = request.nextUrl;

  const program = Effect.gen(function* () {
    // Extract token from URL
    const tokenFromUrl = url.searchParams.get("token");

    if (!tokenFromUrl) {
      return yield* Effect.fail(
        new MissingTokenQueryParameterError({
          operation: "GET /api/auth/verify-email",
          cause: "Missing token query parameter",
        })
      );
    }

    // Get email verification session
    const sessionOption = yield* getEmailVerificationSession();

    if (Option.isNone(sessionOption)) {
      return yield* Effect.fail(
        new InvalidEmailVerificationSessionError({
          operation: "GET api/auth/verify-email",
          cause: "Email verification session is not found or is invalid.",
        })
      );
    }
    // Option.isSome is true, so we can safely access .value
    const {
      email,
      token: tokenFromSession,
      hashedPassword,
    } = sessionOption.value;

    // Verify tokens match - this will fail if they don't match
    yield* timingSafeCompare(tokenFromUrl, tokenFromSession);

    // Assign user role
    const role = yield* assignUserRole(email);

    // Create user in database
    yield* createUserWithProvider(
      email,
      role,
      "credentials",
      undefined,
      hashedPassword
    );

    // Delete email verification session
    yield* deleteEmailVerificationSession();

    // On success, return the URL to redirect to
    return new URL("/signup/success", url);
  });

  const handledProgram = program.pipe(
    // First, tap the error channel to log any failure cause for debugging
    Effect.tapErrorCause((cause) =>
      Effect.logError("Email verification failed", cause)
    ),
    // Now, handle both success and failure to create the final response
    Effect.matchEffect({
      onFailure: (error) => {
        const authErrorUrl = new URL("/signup/error", url);

        // Add the error tag as a query parameter
        const errorTag = "_tag" in error ? error._tag : "UnknownError";
        authErrorUrl.searchParams.set("error", errorTag);

        // Return a successful effect containing the redirect response
        return Effect.succeed(NextResponse.redirect(authErrorUrl));
      },
      onSuccess: (redirectUrl) => {
        // On success, redirect to the email verified page
        return Effect.succeed(NextResponse.redirect(redirectUrl));
      },
    })
  );

  return Effect.runPromise(handledProgram);
}
