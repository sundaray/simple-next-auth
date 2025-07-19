import { Effect, Config } from "effect";

const adminEmailsConfig = Config.array(Config.string(), "ADMIN_EMAILS").pipe(
  Config.map((emails) => emails.map((email) => email.trim().toLowerCase()))
);

export function assignUserRole(email: string) {
  return Effect.gen(function* () {
    const adminEmails = yield* adminEmailsConfig;
    const normalizedEmail = email.trim().toLowerCase();

    return adminEmails.includes(normalizedEmail) ? "admin" : "regular";
  }).pipe(Effect.tapErrorTag("ConfigError", (error) => Effect.logError(error)));
}
