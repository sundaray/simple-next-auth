import "server-only";

import { Effect, Console, Config, Data } from "effect";
import { render } from "@react-email/render";
import { EmailService } from "@/lib/services/email-service";
import { PasswordResetTemplate } from "@/components/auth/password-reset-template";
import { Email, Url } from "@/lib/schema";

class EmailTemplateRenderError extends Data.TaggedError(
  "EmailTemplateRenderError"
)<{ operation: string; cause: unknown }> {}

class EmailSendError extends Data.TaggedError("EmailSendError")<{
  operation: string;
  cause: unknown;
}> {}

/************************************************
 *
 * Send password reset verification email
 *
 ************************************************/

export function sendPasswordResetEmail(email: string, url: string) {
  return Effect.gen(function* () {
    const emailService = yield* EmailService;

    const emailFrom = yield* Config.string("EMAIL_FROM");

    const emailHtml = yield* Effect.tryPromise({
      try: async () => await render(PasswordResetTemplate({ url })),
      catch: (error) =>
        new EmailTemplateRenderError({
          operation: "sendPasswordResetEmail",
          cause: error,
        }),
    });

    yield* emailService
      .send({
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
        Source: emailFrom,
      })
      .pipe(
        Effect.catchTag("EmailError", (error) =>
          Effect.fail(
            new EmailSendError({
              operation: "sendPasswordResetEmail",
              cause: error,
            })
          )
        )
      );
  }).pipe(
    Effect.tapErrorTag("ConfigError", (error) => Console.error(error)),
    Effect.tapErrorTag("EmailTemplateRenderError", (error) =>
      Console.error(error)
    ),
    Effect.tapErrorTag("EmailSendError", (error) => Console.error(error))
  );
}
