"use server";

import { redirect } from "next/navigation";
import { parseWithZod } from "@conform-to/zod";
import { Effect, Data, Option, pipe, Logger } from "effect";

import { hashPassword } from "@/lib/auth/credentials/hash-password";
import { changePassword } from "@/lib/auth/credentials/change-password";
import { ResetPasswordFormSchema } from "@/lib/schema";
import { deletePasswordResetSession } from "@/lib/auth/session/delete-password-reset-session";
import { getPasswordResetSession } from "@/lib/auth/session/get-password-reset-session";

class PasswordResetSessionNotFoundError extends Data.TaggedError(
  "PasswordResetSessionNotFoundError"
) {}

/************************************************
 *
 * Reset user password
 *
 ************************************************/

export async function resetPassword(prevState: unknown, formData: FormData) {
  const submission = parseWithZod(formData, {
    schema: ResetPasswordFormSchema,
  });

  if (submission.status !== "success") {
    return submission.reply();
  }

  const { newPassword } = submission.value;

  const program = Effect.gen(function* () {
    const sessionOption = yield* getPasswordResetSession();

    if (Option.isNone(sessionOption)) {
      return yield* Effect.fail(new PasswordResetSessionNotFoundError());
    }

    const { email } = sessionOption.value;

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
    Effect.map(() => ({ status: "success" as const })),

    Effect.catchTags(handledErrors),

    Effect.provide(Logger.pretty)
  );

  // Execute the Effect
  const result = await Effect.runPromise(handledProgram);

  if (result.status === "success") {
    redirect("/reset-password/success");
  } else {
    return result;
  }
}
