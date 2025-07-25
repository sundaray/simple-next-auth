import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { decodeJwt } from "jose";
import { Effect, Data, Schema } from "effect";
import { AppRuntime } from "@/lib/runtime";

import { exchangeAuthorizationCodeForTokens } from "@/lib/auth/google/exchange-authorization-code-for-tokens";
import { createUserSession } from "@/lib/auth/session/create-user-session";
import { decrypt } from "@/lib/auth/session/decrypt";
import { OAuthStateSchema, GoogleIDTokenSchema } from "@/lib/schema";
import { assignUserRole } from "@/lib/auth/shared/assign-user-role";
import { createUserWithProvider } from "@/lib/auth/shared/create-user-with-provider";

/************************************************
 *
 * Error Types
 *
 ************************************************/

class MissingQueryParametersError extends Data.TaggedError(
  "MissingQueryParametersError"
)<{
  operation: string;
  cause: unknown;
}> {}

class OAuthStateCookieNotFoundError extends Data.TaggedError(
  "OAuthStateCookieNotFoundError"
)<{
  operation: string;
  cause: unknown;
}> {}

class OAuthStateDecryptionFailedError extends Data.TaggedError(
  "OAuthStateDecryptionFailedError"
)<{
  operation: string;
  cause: unknown;
}> {}

class OAuthStateMismatchError extends Data.TaggedError(
  "OAuthStateMismatchError"
)<{
  operation: string;
  cause: unknown;
}> {}

class GoogleIDTokenDecodeError extends Data.TaggedError(
  "GoogleIDTokenDecodeError"
)<{
  operation: string;
  cause: unknown;
}> {}

class InvalidGoogleIdTokenPayloadError extends Data.TaggedError(
  "InvalidGoogleIdTokenPayloadError"
)<{
  operation: string;
  cause: unknown;
}> {}

class UserCreationError extends Data.TaggedError("UserCreationError")<{
  operation: string;
  cause: unknown;
}> {}

class CookieStoreError extends Data.TaggedError("CookieStoreError")<{
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
    // Extract query parameters
    const code = url.searchParams.get("code");
    const stateFromGoogle = url.searchParams.get("state");

    if (!code || !stateFromGoogle) {
      return yield* Effect.fail(
        new MissingQueryParametersError({
          operation: "GET /api/auth/callback/google",
          cause: "Missing code or state query parameters",
        })
      );
    }

    // Get cookie store
    const cookieStore = yield* Effect.tryPromise({
      try: async () => await cookies(),
      catch: (error) =>
        new CookieStoreError({
          operation: "GET /api/auth/callback/google",
          cause: error,
        }),
    });

    // Get OAuth state cookie
    const encryptedOAuthState = cookieStore.get("google_oauth_state")?.value;

    if (!encryptedOAuthState) {
      return yield* Effect.fail(
        new OAuthStateCookieNotFoundError({
          operation: "GET /api/auth/callback/google",
          cause: "OAuth state cookie not found",
        })
      );
    }

    // Decrypt OAuth state
    const oauthState = yield* decrypt(
      encryptedOAuthState,
      OAuthStateSchema
    ).pipe(
      Effect.catchTag("DecryptionError", () =>
        Effect.fail(
          new OAuthStateDecryptionFailedError({
            operation: "GET /api/auth/callback/google",
            cause: "Failed to decrypt OAuth state",
          })
        )
      )
    );

    // Verify state parameter matches
    if (stateFromGoogle !== oauthState.state) {
      return yield* Effect.fail(
        new OAuthStateMismatchError({
          operation: "GET /api/auth/callback/google",
          cause: "State parameter mismatch",
        })
      );
    }

    // Exchange authorization code for tokens
    const token = yield* exchangeAuthorizationCodeForTokens(
      code,
      oauthState.codeVerifier
    );

    // Decode ID token
    const decodedToken = yield* Effect.try({
      try: () => decodeJwt(token.id_token),
      catch: (error) =>
        new GoogleIDTokenDecodeError({
          operation: "GET /api/auth/callback/google",
          cause: error,
        }),
    });

    // 2. Validate the payload's structure with the schema
    const claims = yield* Schema.decodeUnknown(GoogleIDTokenSchema)(
      decodedToken
    ).pipe(
      Effect.mapError(
        (error) =>
          new InvalidGoogleIdTokenPayloadError({
            operation: "GET /api/auth/callback/google",
            cause: error,
          })
      )
    );

    const { email, picture } = claims;

    // Assign user role
    const role = yield* assignUserRole(email);

    // Create user in database
    yield* Effect.tryPromise({
      try: async () =>
        await createUserWithProvider(email, role, "google", picture),
      catch: (error) =>
        new UserCreationError({
          operation: "createUser",
          cause: error,
        }),
    });

    // Create user session
    yield* createUserSession(email, role);

    // Delete the OAuth state cookie
    cookieStore.delete("google_oauth_state");

    // On success, the program's result is the URL to redirect to.
    return new URL(oauthState.redirect, url);
  });

  const handledProgram = program.pipe(
    // First, tap the error channel to log any failure cause for debugging.
    Effect.tapErrorCause((cause) =>
      Effect.logError("Auth callback failed", cause)
    ),
    // Now, handle both success and failure to create the final response.
    Effect.matchEffect({
      onFailure: (error) => {
        const authErrorUrl = new URL("/auth-error", url);
        // Use the error's tag for the query parameter.
        // Provide a fallback for untagged errors.
        const errorTag = "_tag" in error ? error._tag : "UnknownError";
        authErrorUrl.searchParams.set("error", errorTag);

        // Return a successful effect containing the redirect response.
        return Effect.succeed(NextResponse.redirect(authErrorUrl));
      },
      onSuccess: (redirectUrl) => {
        // On success, the program gives us the URL. Create the redirect.
        return Effect.succeed(NextResponse.redirect(redirectUrl));
      },
    })
  );

  return AppRuntime.runPromise(handledProgram);
}
