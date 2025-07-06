import "server-only";

/************************************************
 *
 * Send password reset verification email
 *
 ************************************************/
import { render } from "@react-email/render";
import { sesClient } from "@/lib/aws";
import { SendEmailCommand } from "@aws-sdk/client-ses";

import { PasswordResetTemplate } from "@/components/auth/password-reset-template";

export async function sendPasswordResetEmail(email: string, url: string) {
  // Convert the email to HTML
  const emailHtml = await render(PasswordResetTemplate({ url }));

  const sendEmailCommand = new SendEmailCommand({
    Destination: {
      ToAddresses: [email],
    },
    Message: {
      Body: {
        Html: {
          Charset: "UTF-8",
          Data: emailHtml,
        },
      },
      Subject: {
        Charset: "UTF-8",
        Data: "Reset your password for www.podwise.org",
      },
    },
    Source: process.env.EMAIL_FROM,
  });

  try {
    const response = await sesClient.send(sendEmailCommand);
    console.log("send password reset email response: ", response);
  } catch (error) {
    console.log("[sendPasswordResetEmail] error: ", error);
    const message =
      error instanceof Error ? error.message : `Unknown error: ${error}`;
    throw new Error(`Failed to send password reset email: ${message}`);
  }
}
