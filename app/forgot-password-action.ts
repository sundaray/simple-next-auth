"use server";

import { redirect } from "next/navigation";
import { parseWithZod } from "@conform-to/zod";
import { Effect, pipe } from "effect";

import { ForgotPasswordFormSchema } from "@/schema";

import { createPasswordResetSession } from "@/lib/auth/session/create-password-reset-session";
import { createPasswordResetToken } from "@/lib/auth/credentials/create-password-reset-token";
import { createPasswordResetURL } from "@/lib/auth/credentials/create-password-reset-url";
import { sendPasswordResetEmail } from "@/lib/auth/credentials/send-password-reset-email";
import { EmailService } from "@/lib/services/email-service";

/************************************************
 *
 * Forgot user password
 *
 ************************************************/

export async function forgotPassword(prevState: unknown, formData: FormData) {
  // Parse and validate form data using zod schema
  const submission = parseWithZod(formData, {
    schema: ForgotPasswordFormSchema,
  });

  // Return validation errors if any
  if (submission.status !== "success") {
    return submission.reply();
  }

  const { email } = submission.value;

  // Create an effect
  const program = Effect.gen(function* () {
    const token = yield* createPasswordResetToken();

    const url = yield* createPasswordResetURL(token);

    yield* createPasswordResetSession(email, token);

    yield* sendPasswordResetEmail(email, url);
  });

  // Provide the EmailService layer to satisfy the program's dependencies.
  const runnableProgram = program.pipe(Effect.provide(EmailService.Default));

  const handledErrors = {
    TokenGenerationError: () =>
      Effect.succeed(
        submission.reply({
          formErrors: [
            "Failed to generate password reset token. Please try again.",
          ],
        })
      ),
    ConfigError: () =>
      Effect.succeed(
        submission.reply({
          formErrors: ["Configuration error. Please try again."],
        })
      ),
    PasswordResetSessionCreationError: () =>
      Effect.succeed(
        submission.reply({
          formErrors: [
            "Failed to create password reset session. Please try again.",
          ],
        })
      ),
    EncryptionError: () =>
      Effect.succeed(
        submission.reply({
          formErrors: ["Encryption error. Please try again."],
        })
      ),
    EmailTemplateRenderError: () =>
      Effect.succeed(
        submission.reply({
          formErrors: [
            "Failed to generate password reset email. Please try again.",
          ],
        })
      ),
    EmailSendError: () =>
      Effect.succeed(
        submission.reply({
          formErrors: [
            "Failed to send password reset email. Please try again.",
          ],
        })
      ),
  };

  // Handle the success and failure channels of the Effect.
  const handledProgram = pipe(
    runnableProgram,

    // Since Effect.map() only runs on success, we use it to handle a successful password reset by redirecting the user.
    Effect.map(() => redirect("/forgot-password/check-email")),

    Effect.catchTags(handledErrors)
  );

  // Execute the Effect
  return Effect.runPromise(handledProgram);
}
