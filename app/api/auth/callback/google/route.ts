import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { decodeJwt, JWTPayload } from "jose";
import { Effect, Data, Console } from "effect";

import { assignUserRole } from "@/lib/auth/shared/assign-user-role";
import { createUser } from "@/lib/auth/shared/create-user";
import { exchangeAuthorizationCodeForTokens } from "@/lib/auth/google/exchange-authorization-code-for-tokens";
import { createUserSession } from "@/lib/auth/session/create-user-session";
import { decrypt } from "@/lib/auth/session/decrypt";
import { OAuthStateSchema } from "@/lib/auth/schema";

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

class JWTDecodeError extends Data.TaggedError("JWTDecodeError")<{
  operation: string;
  cause: unknown;
}> {}

class RoleAssignmentError extends Data.TaggedError("RoleAssignmentError")<{
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
 * Type Definitions
 *
 ************************************************/

interface GoogleIdTokenClaims extends JWTPayload {
  name: string;
  email: string;
  picture: string;
}

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
    const tokenData = yield* exchangeAuthorizationCodeForTokens(
      code,
      oauthState.codeVerifier
    );

    // Decode ID token
    const claims = yield* Effect.try({
      try: () => decodeJwt(tokenData.id_token) as GoogleIdTokenClaims,
      catch: (error) =>
        new JWTDecodeError({
          operation: "GET /api/auth/callback/google",
          cause: error,
        }),
    });

    const email = claims.email;
    const picture = claims.picture;

    // Assign user role
    const role = yield* Effect.try({
      try: () => assignUserRole(email),
      catch: (error) =>
        new RoleAssignmentError({
          operation: "assignUserRole",
          cause: error,
        }),
    });

    // Create user in database
    yield* Effect.tryPromise({
      try: async () => await createUser(email, role, "google", picture),
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
      Console.error("Auth callback failed", cause)
    ),
    // Now, handle both success and failure to create the final response.
    Effect.matchEffect({
      onFailure: (error) => {
        const authErrorUrl = new URL("/auth-error", url);
        // Use the error's tag for the query parameter.
        // Provide a fallback for untagged errors.
        const errorTag = "_tag" in error ? error._tag : "UnknownAuthError";
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

  return Effect.runPromise(handledProgram);
}
