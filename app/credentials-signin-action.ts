"use server";

import { redirect } from "next/navigation";
import { parseWithZod } from "@conform-to/zod";
import { Effect, pipe } from "effect";
import { SignInEmailPasswordFormSchema } from "@/schema";

import { getAccountStatus } from "@/lib/auth/credentials/get-account-status";
import { verifyPassword } from "@/lib/auth/credentials/verify-password";
import { createUserSession } from "@/lib/auth/session/create-user-session";
import { getUserRole } from "@/lib/auth/shared/get-user-role";

/************************************************
 *
 * Sign in with email and password
 *
 ************************************************/

export async function signInWithEmailAndPassword(
  next: string,
  prevState: unknown,
  formData: FormData
) {
  const submission = parseWithZod(formData, {
    schema: SignInEmailPasswordFormSchema,
  });

  if (submission.status !== "success") {
    return submission.reply();
  }

  const { email, password } = submission.value;

  // Define an Effect
  const program = Effect.gen(function* () {
    const { _tag } = yield* getAccountStatus(email);

    if (_tag === "NoAccount" || _tag === "UnverifiedAccount") {
      return yield* Effect.fail({
        _tag: "CreateAccount" as const,
        message: "Account doesn't exist. Sign up to create an account.",
      });
    }

    yield* verifyPassword(email, password);

    const role = yield* getUserRole(email);

    yield* createUserSession(email, role);
  });

  const handledErrors = {
    InvalidPasswordError: () =>
      Effect.succeed(
        submission.reply({ formErrors: ["Incorrect email or password."] })
      ),
    DatabaseError: () =>
      Effect.succeed(
        submission.reply({
          formErrors: ["Database error. Please try again."],
        })
      ),
    ConfigError: () =>
      Effect.succeed(
        submission.reply({
          formErrors: ["Configuration error. Please try again."],
        })
      ),
    EncryptionError: () =>
      Effect.succeed(
        submission.reply({
          formErrors: ["Encryption error. Please try again."],
        })
      ),
    UserSessionCreationError: () =>
      Effect.succeed(
        submission.reply({
          formErrors: ["Failed to create user session. Please try again."],
        })
      ),
    PasswordVerificationError: () =>
      Effect.succeed(
        submission.reply({
          formErrors: ["Failed to verify password. Please try again."],
        })
      ),
  };

  // Handle the success and failure channels of the program.
  const handledProgram = pipe(
    program,

    // Since Effect.map() only runs on success, we use it to handle a successful login by redirecting the user.
    Effect.map(() => redirect(next)),

    Effect.catchTag("CreateAccount", (error) =>
      Effect.succeed(submission.reply({ formErrors: [error.message] }))
    ),

    Effect.catchTags(handledErrors)
  );

  // Execute the Effect
  return Effect.runPromise(handledProgram);
}
