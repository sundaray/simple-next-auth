import { Effect, Data } from "effect";
import { SendEmailCommand, SendEmailCommandInput } from "@aws-sdk/client-ses";
import { SesClient } from "@/lib/aws/ses";

class EmailError extends Data.TaggedError("EmailError")<{ cause: unknown }> {}

export class EmailService extends Effect.Service<EmailService>()(
  "EmailService",
  {
    effect: Effect.gen(function* () {
      const sesClient = yield* SesClient;
      return {
        send: (input: SendEmailCommandInput) =>
          Effect.tryPromise({
            try: () => sesClient.send(new SendEmailCommand(input)),
            catch: (error) => new EmailError({ cause: error }),
          }),
      };
    }),
    dependencies: [SesClient.Default],
  }
) {}
