"use server";

import { Effect, pipe } from "effect";
import { redirect } from "next/navigation";
import { generateState } from "@/lib/auth/google/generate-state";
import { generateCodeVerifier } from "@/lib/auth/google/generate-code-verifier";
import { createAuthorizationURLWithPKCE } from "@/lib/auth/google/create-authorization-url-with-pkce";
import { storeOAuthState } from "@/lib/auth/session/store-oauth-state";

/************************************************
 *
 * Sign in with Google
 *
 *************************************************/

export async function authenticateWithGoogle(next: string) {
  // Define the Effect program
  const program = Effect.gen(function* () {
    const state = yield* generateState();
    const codeVerifier = yield* generateCodeVerifier();

    const url = yield* createAuthorizationURLWithPKCE(state, codeVerifier, [
      "openid",
      "email",
      "profile",
    ]);

    yield* storeOAuthState(state, codeVerifier, next);

    return url.toString();
  });

  // Handle the program's success or failure
  const handledProgram = pipe(
    program,
    Effect.map((redirectUrl) => ({
      status: "success" as const,
      redirectUrl,
    })),
    Effect.catchTags({
      StateGenerationError: () =>
        Effect.succeed({
          status: "error" as const,
          message: "Failed to generate state. Please try again.",
        }),
      CodeVerifierGenerationError: () =>
        Effect.succeed({
          status: "error" as const,
          message: "Failed to generate code verifier. Please try again.",
        }),
      CodeChallengeGenerationError: () =>
        Effect.succeed({
          status: "error" as const,
          message: "Failed to generate code challenge. Please try again.",
        }),
      ConfigError: () =>
        Effect.succeed({
          status: "error" as const,
          message: "Configuration error. Please try again.",
        }),
      EncryptionError: () =>
        Effect.succeed({
          status: "error" as const,
          message: "Encryption error. Please try again.",
        }),
      StoreOAuthStateError: () =>
        Effect.succeed({
          status: "error" as const,
          message: "Failed to store OAuth state. Please try again.",
        }),
      InvalidPayloadError: () =>
        Effect.succeed({
          status: "error" as const,
          message: "Invalid payload error. Please try again.",
        }),
    })
  );

  // Execute the Effect
  const result = await Effect.runPromise(handledProgram);

  if (result.status === "success") {
    redirect(result.redirectUrl);
  } else {
    return result;
  }
}
