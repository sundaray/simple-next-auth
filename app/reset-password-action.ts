"use server";

import { redirect } from "next/navigation";
import { parseWithZod } from "@conform-to/zod";
import chalk from "chalk";
import { hashPassword } from "@/lib/auth/credentials/hash-password";

import { updatePassword } from "@/lib/auth/credentials/update-password";
import { ResetPasswordFormSchema } from "@/schema";
import { deletePasswordResetSession } from "@/lib/auth/session/delete-password-reset-session";
import { getPasswordResetSession } from "@/lib/auth/session/get-password-reset-session";
import { doesPasswordResetSessionExist } from "@/lib/auth/session/does-password-reset-session-exist";

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

  let errorOccurred = false;

  try {
    // Verify that there's an active password reset session
    const sessionExists = await doesPasswordResetSessionExist();
    if (!sessionExists) {
      errorOccurred = true;
      return submission.reply({
        formErrors: [
          "Your password reset session has expired. Please request a new password reset link.",
        ],
      });
    }

    // Get email from the password reset session
    const { email } = await getPasswordResetSession();

    // Hash the new password
    const hashedPassword = await hashPassword(newPassword);

    // Update the password in the database
    await updatePassword(email, hashedPassword);

    // Delete the password reset session
    await deletePasswordResetSession();
  } catch (error) {
    if (error instanceof Error) {
      console.error(chalk.red("[resetPassword] error: "), error.message);
    } else {
      console.error(chalk.red("[resetPassword] error: "), error);
    }
    errorOccurred = true;
    return submission.reply({
      formErrors: ["Something went wrong. Please try again."],
    });
  } finally {
    if (!errorOccurred) {
      // Redirect to success page if no errors occurred
      redirect("/reset-password/success");
    }
  }
}
