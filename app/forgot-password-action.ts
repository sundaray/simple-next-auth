"use server";

import { redirect } from "next/navigation";
import { parseWithZod } from "@conform-to/zod";
import chalk from "chalk";
import { hashPassword } from "@/lib/auth/credentials/hash-password";

import { ForgotPasswordFormSchema } from "@/schema";

import { createPasswordResetSession } from "@/lib/auth/session/create-password-reset-session";
import { getPasswordResetSession } from "@/lib/auth/session/get-password-reset-session";
import { doesPasswordResetSessionExist } from "@/lib/auth/session/does-password-reset-session-exist";
import { createPasswordResetToken } from "@/lib/auth/credentials/create-password-reset-token";
import { createPasswordResetURL } from "@/lib/auth/credentials/create-password-reset-url";
import { sendPasswordResetEmail } from "@/lib/auth/credentials/send-password-reset-email";

/************************************************
 *
 * Forgot user password
 *
 ************************************************/

export async function forgotPassword(prevState: unknown, formData: FormData) {
  // const headersList = await headers();
  // const clientIP = (await headersList).get("x-forwarded-for") ?? "127.0.0.1";

  // check rate limit
  // const rateLimitResult = await authRateLimit(clientIP);

  // Parse and validate form data using zod schema
  const submission = parseWithZod(formData, {
    schema: ForgotPasswordFormSchema,
  });

  // Return validation errors if any
  if (submission.status !== "success") {
    return submission.reply();
  }

  // Return rate limit error if any
  // if (rateLimitResult.limited) {
  //   return submission.reply({
  //     formErrors: [rateLimitResult.message],
  //   });
  // }

  const { email } = submission.value;

  let errorOccurred = false;

  try {
    const token = createPasswordResetToken();

    const url = createPasswordResetURL(token);

    await createPasswordResetSession(email, token);

    await sendPasswordResetEmail(email, url);
  } catch (error) {
    errorOccurred = true;

    if (error instanceof Error) {
      console.error(chalk.red("[forgotPassword] error: "), error.message);
    } else {
      console.error(chalk.red("[forgotPassword] error: "), error);
    }
    return submission.reply({
      formErrors: ["Something went wrong. Please try again."],
    });
  } finally {
    if (!errorOccurred) {
      // Redirect to success page if no errors occurred
      redirect("/forgot-password/check-email");
    }
  }
}
