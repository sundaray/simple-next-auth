"use server";

import { Effect } from "effect";
import { redirect } from "next/navigation";
import { parseWithZod } from "@conform-to/zod";
import { SignUpEmailPasswordFormSchema } from "@/schema";

import { getAccountStatus } from "@/lib/auth/credentials/get-account-status";
import { hashPassword } from "@/lib/auth/credentials/hash-password";
import { createEmailVerificationToken } from "@/lib/auth/credentials/create-email-verification-token";
import { createEmailVerificationURL } from "@/lib/auth/credentials/create-email-verification-url";
import { sendVerificationEmail } from "@/lib/auth/credentials/send-verification-email";
import { createEmailVerificationSession } from "@/lib/auth/session/create-email-verification-session";
import { EmailService } from "@/lib/services/email-service";

/************************************************
 *
 * Sign Up With Email and Password
 *
 ************************************************/

const errorMessages: Record<string, string> = {
  EmailTemplateRenderError:
    "Failed to generate verification email. Please try again.",
  EmailSendError: "Failed to send verification email. Please try again.",
  PasswordHashingError: "Failed to hash password. Please try again.",
  EncryptionError: "Encryption error. Please try again.",
  DatabaseError: "Database error. Please try again.",
  ConfigError: "Configuration error. Please try again.",
  EmailVerificationSessionCreationError:
    "Failed to create email verification session. Please try again.",
  TokenGenerationError:
    "Failed to generate verification token. Please try again.",
};

export async function signUpWithEmailAndPassword(
  next: string,
  prevState: unknown,
  formData: FormData
) {
  const submission = parseWithZod(formData, {
    schema: SignUpEmailPasswordFormSchema,
  });

  if (submission.status !== "success") {
    return submission.reply();
  }

  const { email, password } = submission.value;

  // Create an effect
  const program = Effect.gen(function* () {
    const { _tag } = yield* getAccountStatus(email);

    if (_tag === "VerifiedAccount") {
      return yield* Effect.fail({
        _tag: "AccountAlreadyExistsError" as const,
        message: "Account already exists. Please sign in.",
      });
    }
    const token = yield* createEmailVerificationToken();

    const url = yield* createEmailVerificationURL(token);

    const hashedPassword = yield* hashPassword(password);

    yield* createEmailVerificationSession(email, hashedPassword, token);

    yield* sendVerificationEmail(email, url);
  });

  // Provide the EmailService layer to satisfy the program's dependencies.
  const runnableProgram = program.pipe(Effect.provide(EmailService.Default));

  // Handle the program's success or failure
  const handledProgram = Effect.match(runnableProgram, {
    onFailure: (error) => {
      if (error._tag === "AccountAlreadyExistsError") {
        return submission.reply({ formErrors: [error.message] });
      }
      const message =
        errorMessages[error._tag] || "Something went wrong. Please try again.";
      return submission.reply({
        formErrors: [message],
      });
    },
    onSuccess: () => {
      redirect("/signup/verify-email");
    },
  });

  return Effect.runPromise(handledProgram);
}
