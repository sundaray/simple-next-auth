"use server";

import { redirect } from "next/navigation";
import { parseWithZod } from "@conform-to/zod";
import { Effect } from "effect";
import { SignInEmailPasswordFormSchema } from "@/schema";

import { getAccountStatus } from "@/lib/auth/credentials/get-account-status";
import { verifyPassword } from "@/lib/auth/credentials/verify-password";
import { createUserSession } from "@/lib/auth/session";
import { getUserRole } from "@/lib/auth/get-user-role";

/************************************************
 *
 * Sign in with email and password
 *
 ************************************************/

const errorMessages: Record<string, string> = {
  InvalidPasswordError: "Incorrect email or password.",
  DatabaseError: "Database error. Please try again.",
  ConfigError: "Configuration error. Please try again.",
  EncryptionError: "Encryption error. Please try again.",
  UserSessionCreationError: "Failed to create user session. Please try again.",
  PasswordVerificationError: "Failed to verify password. Please try again.",
};

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

  // Transform the Effect to handle both success and failure cases
  const handledProgram = Effect.match(program, {
    onFailure: (error) => {
      if (error._tag === "CreateAccount") {
        return submission.reply({ formErrors: [error.message] });
      }
      const message =
        errorMessages[error._tag] || "Something went wrong. Please try again.";
      return submission.reply({ formErrors: [message] });
    },
    onSuccess: () => redirect(next),
  });

  // Execute the Effect
  return Effect.runPromise(handledProgram);
}
