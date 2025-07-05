"use server";

import { Effect } from "effect";
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

const errorMessages: Record<string, string> = {
  StateGenerationError: "Failed to generate OAuth state. Please try again.",
  CodeVerifierGenerationError:
    "Failed to generate code verifier. Please try again.",
  ConfigError: "Configuration error. Please try again.",
  CodeChallengeGenerationError:
    "Failed to generate code challenge. Please try again.",
  EncryptionError: "Encryption error. Please try again.",
  StoreOAuthStateError: "Failed to store OAuth session. Please try again.",
};
export async function signInWithGoogle(next: string) {
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
  const handledProgram = Effect.match(program, {
    onFailure: (error) => {
      const message =
        errorMessages[error._tag] || "Something went wrong. Please try again.";
      return { errors: [message] };
    },
    onSuccess: (redirectUrl) => redirect(redirectUrl),
  });

  // Execute the Effect
  return Effect.runPromise(handledProgram);
}
