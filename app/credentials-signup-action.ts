"use server";

import { Effect, pipe, Logger } from "effect";
import { redirect } from "next/navigation";
import { parseWithZod } from "@conform-to/zod";
import { CredentialsSignUpFormSchema } from "@/lib/schema";

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

export async function signUpWithEmailAndPassword(
  next: string,
  prevState: unknown,
  formData: FormData
) {
  const submission = parseWithZod(formData, {
    schema: CredentialsSignUpFormSchema,
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

  const handledErrors = {
    EmailVerificationSessionCreationError: () =>
      Effect.succeed(
        submission.reply({
          formErrors: [
            "Failed to create email verification session. Please try again.",
          ],
        })
      ),
    EmailTemplateRenderError: () =>
      Effect.succeed(
        submission.reply({
          formErrors: [
            "Failed to generate verification email. Please try again.",
          ],
        })
      ),
    EmailSendError: () =>
      Effect.succeed(
        submission.reply({
          formErrors: ["Failed to send verification email. Please try again."],
        })
      ),
    PasswordHashingError: () =>
      Effect.succeed(
        submission.reply({
          formErrors: ["Failed to hash password. Please try again."],
        })
      ),
    EncryptionError: () =>
      Effect.succeed(
        submission.reply({
          formErrors: ["Encryption error. Please try again."],
        })
      ),
    InvalidJWTPayloadError: () =>
      Effect.succeed(
        submission.reply({
          formErrors: ["Invalid payload error. Please try again."],
        })
      ),
    TokenGenerationError: () =>
      Effect.succeed(
        submission.reply({
          formErrors: [
            "Failed to generate verification token. Please try again.",
          ],
        })
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
  };

  // Handle the success and failure channels of the Effect.
  const handledProgram = pipe(
    runnableProgram,

    // Since Effect.map() only runs on success, we use it to handle a successful signup by redirecting the user.
    Effect.map(() => ({ status: "success" as const })),

    Effect.catchTag("AccountAlreadyExistsError", (error) =>
      Effect.succeed(
        submission.reply({
          formErrors: [error.message],
        })
      )
    ),
    Effect.catchTags(handledErrors),

    Effect.provide(Logger.pretty)
  );

  const result = await Effect.runPromise(handledProgram);

  if (result.status === "success") {
    return redirect("/signup/check-email");
  } else {
    return result;
  }
}
