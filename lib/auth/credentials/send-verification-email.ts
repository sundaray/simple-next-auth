import "server-only";

import { Effect, Console, Config, Data } from "effect";
import { render } from "@react-email/render";
import { EmailService } from "@/lib/services/email-service";
import { EmailVerificationTemplate } from "@/components/auth/email-verification-template";

class EmailTemplateRenderError extends Data.TaggedError(
  "EmailTemplateRenderError"
)<{ operation: string; cause: unknown }> {}

class EmailSendError extends Data.TaggedError("EmailSendError")<{
  operation: string;
  cause: unknown;
}> {}

export function sendVerificationEmail(email: string, url: string) {
  return Effect.gen(function* () {
    const emailService = yield* EmailService;

    const emailFrom = yield* Config.string("EMAIL_FROM");

    const emailHtml = yield* Effect.tryPromise({
      try: async () => await render(EmailVerificationTemplate(url)),
      catch: (error) =>
        new EmailTemplateRenderError({
          operation: "sendVerificationEmail",
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
            Data: "Sign-up link for www.podwise.org",
          },
        },
        Source: emailFrom,
      })
      .pipe(
        Effect.catchTag("EmailError", (error) =>
          Effect.fail(
            new EmailSendError({
              operation: "sendVerificationEmail",
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
