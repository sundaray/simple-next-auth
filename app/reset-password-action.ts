"use server";

import { redirect } from "next/navigation";
import { parseWithZod } from "@conform-to/zod";
import { Effect, pipe } from "effect";

import { hashPassword } from "@/lib/auth/credentials/hash-password";
import { changePassword } from "@/lib/auth/credentials/change-password";
import { ResetPasswordFormSchema } from "@/schema";
import { deletePasswordResetSession } from "@/lib/auth/session/delete-password-reset-session";
import { getPasswordResetSession } from "@/lib/auth/session/get-password-reset-session";

/************************************************
 *
 * Reset user password
 *
 ************************************************/

export async function resetPassword(prevState: unknown, formData: FormData) {
  // Parse and validate form data using zod schema
  const submission = parseWithZod(formData, {
    schema: ResetPasswordFormSchema,
  });

  // Return validation errors if any
  if (submission.status !== "success") {
    return submission.reply();
  }

  // Extract validated password
  const { newPassword } = submission.value;

  // Create an effect
  const program = Effect.gen(function* () {
    // Get email from the password reset session
    const { email } = yield* getPasswordResetSession();

    // Hash the new password
    const hashedPassword = yield* hashPassword(newPassword);

    // Change the password in the database
    yield* changePassword(email, hashedPassword);

    // Delete the password reset session
    yield* deletePasswordResetSession();
  });

  const handledErrors = {
    PasswordHashingError: () =>
      Effect.succeed(
        submission.reply({
          formErrors: ["Failed to hash password. Please try again."],
        })
      ),
    DatabaseError: () =>
      Effect.succeed(
        submission.reply({
          formErrors: ["Database error. Please try again."],
        })
      ),
    CookieStoreAccessError: () =>
      Effect.succeed(
        submission.reply({
          formErrors: ["Failed to access cookie store. Please try again."],
        })
      ),
    ConfigError: () =>
      Effect.succeed(
        submission.reply({
          formErrors: ["Configuration error. Please try again."],
        })
      ),
    InvalidJWTPayloadError: () =>
      Effect.succeed(
        submission.reply({
          formErrors: ["Invalid JWT payload error. Please try again."],
        })
      ),
    DecryptionError: () =>
      Effect.succeed(
        submission.reply({
          formErrors: ["Decryption error. Please try again."],
        })
      ),
    PasswordResetSessionNotFoundError: () =>
      Effect.succeed(
        submission.reply({
          formErrors: [
            "Password reset session not found. Please request a new password reset link.",
          ],
        })
      ),
    PasswordResetSessionDeletionError: () =>
      Effect.succeed(
        submission.reply({
          formErrors: [
            "Failed to delete password reset session. Please try again.",
          ],
        })
      ),
  };

  // Handle the success and failure channels of the Effect.
  const handledProgram = pipe(
    program,

    // Since Effect.map() only runs on success, we use it to handle a successful password reset by redirecting the user.
    Effect.map(() => redirect("/reset-password/success")),

    Effect.catchTags(handledErrors)
  );

  // Execute the Effect
  return Effect.runPromise(handledProgram);
}
