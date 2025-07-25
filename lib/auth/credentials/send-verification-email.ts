import "server-only";

import { Effect, Config, Data } from "effect";
import { render } from "@react-email/render";
import { EmailService } from "@/lib/services/email-service";
import { EmailVerificationTemplate } from "@/components/auth/email-verification-template";
import { SendEmailCommand, SendEmailCommandInput } from "@aws-sdk/client-ses";

class EmailTemplateRenderError extends Data.TaggedError(
  "EmailTemplateRenderError"
)<{ operation: string; cause: unknown }> {}

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

    const emailInput: SendEmailCommandInput = {
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
          Data: "Sign-up link for Simple Next Auth",
        },
      },
      Source: emailFrom,
    };

    const command = new SendEmailCommand(emailInput);

    yield* emailService.use((client) => client.send(command));
  }).pipe(
    Effect.tapErrorTag("ConfigError", (error) => Effect.logError(error)),
    Effect.tapErrorTag("EmailError", (error) =>
      Effect.logError({ error, operation: "sendVerificationEmail" })
    ),
    Effect.tapErrorTag("EmailTemplateRenderError", (error) =>
      Effect.logError(error)
    )
  );
}
